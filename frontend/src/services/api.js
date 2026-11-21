const API_URL = import.meta.env.VITE_API_URL;

// Fetch all leads
export const getLeads = async () => {
    const response = await fetch(`${API_URL}/leads`);

    if (!response.ok) {
        throw new Error("Failed to fetch leads");
    }

    return response.json();
};

// Create a new lead
export const createLead = async (leadData) => {
    const response = await fetch(`${API_URL}/leads`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(leadData)
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Failed to create lead");
    }

    return data;
};