require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const xml2js = require('xml2js');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

class VehicleService {
    constructor() {
        this.NHTSA_API_BASE_URL = 'https://vpic.nhtsa.dot.gov/api/vehicles';
        this.FUEL_ECONOMY_BASE_URL = 'https://www.fueleconomy.gov/ws/rest/vehicle';
    }

    validateVIN(vin) {
        if (!vin) {
            throw new Error("Please enter a VIN number.");
        }
        if (vin.length !== 17) {
            throw new Error("Please enter a valid 17-character VIN.");
        }
        return true;
    }

    async fetchVehicleData(vin) {
        const url = `${this.NHTSA_API_BASE_URL}/decodevinvalues/${vin}?format=json`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error('Failed to fetch vehicle data');
        }
        
        const data = await response.json();
        return data;
    }

    async fetchFuelEconomyData(year, make, model) {
        try {
            const optionsUrl = `${this.FUEL_ECONOMY_BASE_URL}/menu/options?year=${year}&make=${make}&model=${model}`;
            const optionsRes = await fetch(optionsUrl);
            const optionsText = await optionsRes.text();
            
            // Parse XML response
            const parser = new xml2js.Parser({ explicitArray: false });
            const optionsData = await parser.parseStringPromise(optionsText);
            
            if (!optionsData?.menuItems?.menuItem?.value) {
                return null;
            }

            const vehicleId = optionsData.menuItems.menuItem.value;
            const vehicleDetailUrl = `${this.FUEL_ECONOMY_BASE_URL}/${vehicleId}`;
            const detailRes = await fetch(vehicleDetailUrl);
            const detailText = await detailRes.text();
            const detailData = await parser.parseStringPromise(detailText);

            return {
                cityMPG: detailData?.vehicle?.city08 || "N/A",
                highwayMPG: detailData?.vehicle?.highway08 || "N/A",
                combinedMPG: detailData?.vehicle?.comb08 || "N/A",
                engineSize: detailData?.vehicle?.displ || "N/A",
                cylinders: detailData?.vehicle?.cylinders || "N/A",
                fuelType: detailData?.vehicle?.fuelType || "N/A"
            };
        } catch (error) {
            console.error("FuelEconomy API Error:", error);
            return null;
        }
    }
}

const vehicleService = new VehicleService();

// API Routes
app.get('/api/vehicle/:vin', async (req, res) => {
    try {
        const { vin } = req.params;
        
        // Validate VIN
        vehicleService.validateVIN(vin);
        
        // Fetch vehicle data
        const vehicleData = await vehicleService.fetchVehicleData(vin);
        
        // Fetch fuel economy data if vehicle data was found
        let fuelData = null;
        if (vehicleData?.Results?.[0]) {
            const vehicle = vehicleData.Results[0];
            fuelData = await vehicleService.fetchFuelEconomyData(
                vehicle.ModelYear,
                vehicle.Make,
                vehicle.Model
            );
        }
        
        // Send combined response
        res.json({
            success: true,
            vehicleData: vehicleData.Results[0],
            fuelData
        });
        
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Start server
app.listen(port, () => {
    console.log(`Vehicle Search API server running on port ${port}`);
});