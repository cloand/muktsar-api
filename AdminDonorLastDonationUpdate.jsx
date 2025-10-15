import React, { useState } from 'react';
import axios from 'axios';

/**
 * Admin component to update donor's last donation date
 * Only accessible by admin users
 */
const AdminDonorLastDonationUpdate = ({ donor, onUpdate, adminToken }) => {
  const [lastDonationDate, setLastDonationDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validate date is not in the future
      const selectedDate = new Date(lastDonationDate);
      const today = new Date();
      
      if (selectedDate > today) {
        setError('Last donation date cannot be in the future.');
        setIsLoading(false);
        return;
      }

      // Make API call to update last donation date
      const response = await axios.patch(
        `http://localhost:3000/donors/${donor.id}/last-donation`,
        {
          lastDonationDate: selectedDate.toISOString()
        },
        {
          headers: {
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setSuccess(`Successfully updated ${donor.name}'s last donation date!`);
      setLastDonationDate('');
      
      // Call parent component's update handler
      if (onUpdate) {
        onUpdate(response.data);
      }

    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to update last donation date';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="admin-donor-update-card">
      <div className="donor-info">
        <h3>Update Last Donation Date</h3>
        <div className="donor-details">
          <p><strong>Donor:</strong> {donor.name}</p>
          <p><strong>Blood Group:</strong> {donor.bloodGroup}</p>
          <p><strong>Current Last Donation:</strong> {formatDate(donor.lastDonationDate)}</p>
          <p><strong>Total Donations:</strong> {donor.totalDonations}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="update-form">
        <div className="form-group">
          <label htmlFor="lastDonationDate">
            New Last Donation Date:
          </label>
          <input
            type="date"
            id="lastDonationDate"
            value={lastDonationDate}
            onChange={(e) => setLastDonationDate(e.target.value)}
            max={new Date().toISOString().split('T')[0]} // Prevent future dates
            required
            disabled={isLoading}
          />
        </div>

        {error && (
          <div className="error-message">
            ❌ {error}
          </div>
        )}

        {success && (
          <div className="success-message">
            ✅ {success}
          </div>
        )}

        <button 
          type="submit" 
          disabled={isLoading || !lastDonationDate}
          className="update-button"
        >
          {isLoading ? 'Updating...' : 'Update Last Donation Date'}
        </button>
      </form>

      <style jsx>{`
        .admin-donor-update-card {
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 20px;
          margin: 10px 0;
          background-color: #f9f9f9;
          max-width: 500px;
        }

        .donor-info h3 {
          color: #333;
          margin-bottom: 15px;
          border-bottom: 2px solid #007bff;
          padding-bottom: 5px;
        }

        .donor-details p {
          margin: 8px 0;
          color: #555;
        }

        .form-group {
          margin: 15px 0;
        }

        .form-group label {
          display: block;
          margin-bottom: 5px;
          font-weight: bold;
          color: #333;
        }

        .form-group input {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 16px;
        }

        .form-group input:focus {
          outline: none;
          border-color: #007bff;
          box-shadow: 0 0 5px rgba(0, 123, 255, 0.3);
        }

        .update-button {
          background-color: #007bff;
          color: white;
          padding: 12px 20px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 16px;
          width: 100%;
          transition: background-color 0.3s;
        }

        .update-button:hover:not(:disabled) {
          background-color: #0056b3;
        }

        .update-button:disabled {
          background-color: #ccc;
          cursor: not-allowed;
        }

        .error-message {
          background-color: #f8d7da;
          color: #721c24;
          padding: 10px;
          border-radius: 4px;
          margin: 10px 0;
          border: 1px solid #f5c6cb;
        }

        .success-message {
          background-color: #d4edda;
          color: #155724;
          padding: 10px;
          border-radius: 4px;
          margin: 10px 0;
          border: 1px solid #c3e6cb;
        }
      `}</style>
    </div>
  );
};

// Example usage component
const AdminDonorManagement = () => {
  const [donors, setDonors] = useState([]);
  const [adminToken, setAdminToken] = useState('your-admin-jwt-token-here');

  const handleDonorUpdate = (updatedDonor) => {
    // Update the donor in the local state
    setDonors(prevDonors => 
      prevDonors.map(donor => 
        donor.id === updatedDonor.id ? updatedDonor : donor
      )
    );
  };

  return (
    <div className="admin-panel">
      <h2>Admin - Donor Last Donation Management</h2>
      <p>Update donor last donation dates when they donate blood.</p>
      
      {donors.map(donor => (
        <AdminDonorLastDonationUpdate
          key={donor.id}
          donor={donor}
          onUpdate={handleDonorUpdate}
          adminToken={adminToken}
        />
      ))}
    </div>
  );
};

export default AdminDonorLastDonationUpdate;
