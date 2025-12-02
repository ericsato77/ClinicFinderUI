import { useState, useEffect, useMemo, useCallback } from 'react';
import { getFacilitiesGeoJSON, getDistricts, getAmenityTypes, getNearbyFacilities } from '../services/api';

export const regionOptions = [
    'Central',
    'Northern',
    'Southern',
    'South',
];

export const useClinics = () => {
    const [facilities, setFacilities] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [amenityTypes, setAmenityTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        searchQuery: '',
        district: '',
        region: '',
        amenity: '',
        emergency: '',
        wheelchair: '',
        distance: 50, // km radius
        useDistance: false,
    });

    const fetchFacilities = useCallback(async (userLat = null, userLng = null) => {
        try {
            setLoading(true);
            setError(null);

            // Convert filters to API format (emergency and wheelchair should be 'yes' or empty string)
            // Don't send searchQuery to backend - we filter locally for instant results
            const apiFilters = {
                district: filters.district,
                region: filters.region,
                amenity: filters.amenity,
                emergency: filters.emergency === 'yes' ? 'yes' : '',
                wheelchair: filters.wheelchair === 'yes' ? 'yes' : '',
            };

            console.log('Fetching facilities with filters:', apiFilters);

            let facilitiesData;
            let facilitiesArray;

            // Use distance-based search if enabled and user location available
            if (filters.useDistance && userLat && userLng) {
                console.log('Using distance filter:', filters.distance, 'km from', userLat, userLng);
                facilitiesData = await getNearbyFacilities(userLat, userLng, filters.distance, apiFilters);
                
                console.log('Received nearby facilities data:', facilitiesData);
                
                // Nearby API returns {facilities: [...]} with flat structure
                facilitiesArray = facilitiesData.facilities.map(facility => ({
                    id: facility.id,
                    name: facility.name,
                    address: `${facility.district}, ${facility.region}`,
                    district: facility.district,
                    region: facility.region,
                    amenity: facility.amenity,
                    emergency: facility.emergency,
                    wheelchair: facility.wheelchair,
                    operator: facility.operator,
                    beds: facility.beds,
                    latitude: facility.latitude,
                    longitude: facility.longitude,
                    distance_km: facility.distance_km, // Only available in nearby results
                }));
            } else {
                // Fetch all facilities with filters
                facilitiesData = await getFacilitiesGeoJSON(apiFilters);
                
                console.log('Received GeoJSON data:', facilitiesData);
                console.log('Features count:', facilitiesData.features?.length);
                
                // GeoJSON API returns {features: [...]} with GeoJSON structure
                facilitiesArray = facilitiesData.features.map(feature => ({
                    id: feature.id,
                    name: feature.properties.name,
                    address: feature.properties.address || `${feature.properties.district}, ${feature.properties.region}`,
                    district: feature.properties.district,
                    region: feature.properties.region,
                    amenity: feature.properties.amenity,
                    emergency: feature.properties.emergency,
                    wheelchair: feature.properties.wheelchair,
                    operator: feature.properties.operator,
                    beds: feature.properties.beds,
                    latitude: feature.geometry.coordinates[1],
                    longitude: feature.geometry.coordinates[0],
                }));
            }

            console.log('Processed facilities:', facilitiesArray.length);
            setFacilities(facilitiesArray);
        } catch (err) {
            console.error('Error fetching facilities:', err);
            setError(err.message || 'Failed to load facilities');
        } finally {
            setLoading(false);
        }
    }, [filters]);

    const fetchMetadata = useCallback(async () => {
        try {
            // Fetch districts and amenity types (no filters needed)
            const [districtsData, amenityData] = await Promise.all([
                getDistricts(),
                getAmenityTypes()
            ]);

            setDistricts(districtsData);
            setAmenityTypes(amenityData);
        } catch (err) {
            console.error('Error fetching metadata:', err);
        }
    }, []);

    // Fetch metadata on mount
    useEffect(() => {
        fetchMetadata();
    }, [fetchMetadata]);

    // Fetch facilities when filters change (excluding searchQuery which is filtered client-side)
    useEffect(() => {
        fetchFacilities();
    }, [
        filters.district,
        filters.region,
        filters.amenity,
        filters.emergency,
        filters.wheelchair,
        filters.distance,
        filters.useDistance
    ]);

    const filteredClinics = useMemo(() => {
        let filtered = [...facilities];
        
        // Client-side search filtering for instant results
        if (filters.searchQuery && filters.searchQuery.trim()) {
            const query = filters.searchQuery.toLowerCase().trim();
            filtered = filtered.filter(facility => 
                facility.name?.toLowerCase().includes(query) ||
                facility.district?.toLowerCase().includes(query) ||
                facility.region?.toLowerCase().includes(query) ||
                facility.amenity?.toLowerCase().includes(query) ||
                facility.operator?.toLowerCase().includes(query)
            );
        }
        
        return filtered;
    }, [facilities, filters.searchQuery]);

    const updateFilter = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const clearFilters = () => {
        setFilters({
            searchQuery: '',
            district: '',
            region: '',
            amenity: '',
            emergency: '',
            wheelchair: '',
            distance: 50,
            useDistance: false,
        });
    };

    return {
        clinics: filteredClinics,
        facilities: filteredClinics,
        districts,
        amenityTypes,
        filters,
        updateFilter,
        clearFilters,
        loading,
        error,
        totalCount: facilities.length,
        regionOptions,
        refetchWithLocation: fetchFacilities
    };
};
