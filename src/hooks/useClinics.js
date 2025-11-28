import { useState, useMemo } from 'react';
import { clinics } from '../data/clinics';

export const useClinics = () => {
    const [filters, setFilters] = useState({
        searchQuery: '',
        services: [],
        insurance: false, // Toggle for "Accepts Insurance" generally, or could be specific
        distance: 50,
        openNow: false,
        minRating: 0
    });

    const filteredClinics = useMemo(() => {
        return clinics.filter(clinic => {
            // Search Query (Name or Address)
            if (filters.searchQuery &&
                !clinic.name.toLowerCase().includes(filters.searchQuery.toLowerCase()) &&
                !clinic.address.toLowerCase().includes(filters.searchQuery.toLowerCase())) {
                return false;
            }

            // Services
            if (filters.services.length > 0) {
                const hasService = filters.services.some(service => clinic.services.includes(service));
                if (!hasService) return false;
            }

            // Insurance (Simple toggle logic: if true, must accept at least one major insurance)
            // In a real app, this might match against a user's specific insurance
            if (filters.insurance && clinic.insurance.length === 0) {
                return false;
            }

            // Distance
            if (clinic.distance > filters.distance) {
                return false;
            }

            // Open Now
            if (filters.openNow && !clinic.isOpen) {
                return false;
            }

            // Rating
            if (clinic.rating < filters.minRating) {
                return false;
            }

            return true;
        });
    }, [filters]);

    const updateFilter = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    return {
        clinics: filteredClinics,
        filters,
        updateFilter,
        totalCount: filteredClinics.length
    };
};
