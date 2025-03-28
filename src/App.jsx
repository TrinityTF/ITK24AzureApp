// src/App.jsx

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Server, Search, Trash2, ExternalLink, AlertTriangle, WifiOff, RotateCw } from 'lucide-react';
import './App.css'; // Make sure your CSS file is imported and contains necessary styles

function App() {
  // --- State Variables ---
  const [apiStatus, setApiStatus] = useState('checking'); // 'checking', 'connected', 'error'
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [expandedUser, setExpandedUser] = useState(null); // Tracks the currently expanded user's Name
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Specifically for the 'Load Users' or 'Retry' action
  const [error, setError] = useState(null); // Stores error messages

  // --- Constants ---

  // CRITICAL FIX for 404 Error: Use the RELATIVE path for SWA managed functions proxy
  const API_BASE_URL = '/api';

  // Hardcoded links (keep as is or fetch dynamically if needed)
  const resourceGroupLinks = {
    'Allan': 'https://portal.azure.com/#@followercase.com/resource/subscriptions/531371bc-4ac6-4729-a4fe-8ded1d4fedce/resourceGroups/itk24-allanild/overview',
    'Agu': 'https://portal.azure.com/#@followercase.com/resource/subscriptions/531371bc-4ac6-4729-a4fe-8ded1d4fedce/resourceGroups/ITK24-AguToomasPihelgas/overview',
    'Elis': 'https://portal.azure.com/#@followercase.com/resource/subscriptions/531371bc-4ac6-4729-a4fe-8ded1d4fedce/resourceGroups/ITK24-Elis/overview',
    'Janis': 'https://portal.azure.com/#@followercase.com/resource/subscriptions/531371bc-4ac6-4729-a4fe-8ded1d4fedce/resourceGroups/ITK24-JanisJõgi/overview',
    'Kaido': 'https://portal.azure.com/#@followercase.com/resource/subscriptions/531371bc-4ac6-4729-a4fe-8ded1d4fedce/resourceGroups/ITK24-Kaido/overview',
    'Robert': 'https://portal.azure.com/#@followercase.com/resource/subscriptions/531371bc-4ac6-4729-a4fe-8ded1d4fedce/resourceGroups/ITK24-Robert/overview',
    'Sanne': 'https://portal.azure.com/#@followercase.com/resource/subscriptions/531371bc-4ac6-4729-a4fe-8ded1d4fedce/resourceGroups/ITK24-SANNE/overview',
    'Kersti': 'https://portal.azure.com/#@followercase.com/resource/subscriptions/531371bc-4ac6-4729-a4fe-8ded1d4fedce/resourceGroups/ITK24_KerstiLooke/overview',
    'Liisa': 'https://portal.azure.com/#@followercase.com/resource/subscriptions/531371bc-4ac6-4729-a4fe-8ded1d4fedce/resourceGroups/ITK24_LiisaManglus/overview'
    // Add other users if necessary
  };

  // --- Helper Function ---
  // Define the function to perform the API check and user load
  const checkApiAndLoadUsers = async (loadUsers = false) => {
    if (!loadUsers) {
      setApiStatus('checking');
    }
    setIsLoading(true); // Indicate loading state for both check and load
    setError(null); // Clear previous errors

    try {
      // Always check connection first (quick check)
      const connResponse = await axios.get(`${API_BASE_URL}/check-connection`);
      if (!connResponse.data.connected) {
        throw new Error('API reported database connection issue.');
      }
      // If check passes, update status immediately
      setApiStatus('connected');

      // If loadUsers is true, proceed to fetch users
      if (loadUsers) {
        const usersResponse = await axios.get(`${API_BASE_URL}/users`);
        setUsers(usersResponse.data || []); // Ensure response.data is an array
      }
      // No error occurred
      setError(null); // Ensure error state is cleared on success

    } catch (err) {
      console.error('API Error:', err);
      setApiStatus('error');
      setError(err.response?.data?.error || err.message || 'Failed to connect or load data from API.');
      setUsers([]); // Clear users on any error during check or load
      setFilteredUsers([]);
    } finally {
      setIsLoading(false); // Stop loading indicator
    }
  };


  // --- Effects ---

  // 1. Check initial API connection status on component mount
  useEffect(() => {
    checkApiAndLoadUsers(false); // Check connection only on initial mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array ensures this runs only once on mount


  // 2. Filter users whenever the search term or the main user list changes
  useEffect(() => {
    if (users.length > 0) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      const filtered = users.filter(user =>
        user.Name?.toLowerCase().startsWith(lowerSearchTerm) // Add safe navigation '?'
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers([]); // Clear filtered list if no users or users cleared due to error
    }
  }, [searchTerm, users]);

  // --- Event Handlers ---

  // Trigger loading users data (will also re-check connection implicitly)
  const handleLoadUsersClick = () => {
    checkApiAndLoadUsers(true); // Set loadUsers flag to true
  };

  // Toggle user details view
  const handleUserBoxClick = (userName) => {
    setExpandedUser(prevExpandedUser =>
      prevExpandedUser === userName ? null : userName
    );
  };

  // Open the specific resource group link for Agu
  const openAguResourceGroup = () => {
    const aguLink = resourceGroupLinks['Agu'];
    if (aguLink) {
      window.open(aguLink, '_blank', 'noopener,noreferrer');
    } else {
      console.warn("Link for 'Agu' not found in resourceGroupLinks");
    }
  };

  // Handle clicking external links inside user details without collapsing the box
  const handleLinkClick = (event) => {
    event.stopPropagation();
  };


  // --- Conditional Rendering Logic ---

  const renderContent = () => {
    // State 1: Checking initial API status or Reloading
    if (isLoading && apiStatus === 'checking') {
        return (
            <div className="container status-box">
            <span className="spinner-large"></span>
            <p>Checking API connection...</p>
            </div>
        );
    }


    // State 2: API connection error (initial check or during load)
    if (apiStatus === 'error') {
      return (
        <div className="container status-box error-box">
          <WifiOff size={48} color="#DC3545" />
          <h2>API / Database Unavailable</h2>
          <p className="error-message">{error || 'Could not connect to the backend or database.'}</p>
          {/* Use handleLoadUsersClick which inherently retries connection check */}
          <button onClick={handleLoadUsersClick} disabled={isLoading} className="retry-button">
            {isLoading ? (
              <>
                <span className="spinner"></span> Retrying...
              </>
            ) : (
              <>
                <RotateCw size={16} style={{ marginRight: 8 }}/> Retry Connection
              </>
             )}
          </button>
        </div>
      );
    }

    // State 3: API Connected, but users not loaded yet (or cleared after error)
    if (apiStatus === 'connected' && users.length === 0) {
      return (
        <div className="container status-box connection-box">
          <Server size={48} color="#107C10" />
          <h2>API Ready</h2>
          <p>Backend API is connected. Ready to load user data.</p>
          <button
            onClick={handleLoadUsersClick} // Use the same handler to load users
            disabled={isLoading}
            className={`load-button ${isLoading ? 'loading' : ''}`}
          >
            {isLoading ? (
              <>
                <span className="spinner"></span> Loading Users...
              </>
            ) : (
              'Load Users'
            )}
          </button>
          {/* Display error here ONLY if a previous load attempt failed but connection is now okay */}
          {error && !isLoading && <p className="error-message">{error}</p>}
        </div>
      );
    }

    // State 4: Users loaded successfully
    if (apiStatus === 'connected' && users.length > 0) {
      return (
        <>
          {/* Optional Action Box */}
          <div className="delete-services-box">
             <div className="delete-services-content">
               <Trash2 size={28} color="#DC3545" />
               <div className="delete-services-text">
                 <h3>Manage Agu's Resources</h3>
                 {/* Add more descriptive text if needed */}
               </div>
               <button
                 className="delete-services-button"
                 onClick={openAguResourceGroup} // Use specific handler
               >
                 Open Azure Portal <ExternalLink size={16} style={{ marginLeft: 8 }} />
               </button>
             </div>
           </div>

          {/* User List */}
          <div className="user-list">
            {/* Display filtered list */}
            {filteredUsers.map((user) => (
              <div
                key={user.Name || user.id} // Use a unique key, Name might not be unique? Add 'id' if available from DB
                className={`user-box ${expandedUser === user.Name ? 'expanded' : ''}`}
                onClick={() => handleUserBoxClick(user.Name)} // Pass user's name
                role="button" // Add role for accessibility
                tabIndex={0} // Make it focusable
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleUserBoxClick(user.Name)} // Keyboard accessibility
              >
                <h3>{user.Name || 'Unnamed User'}</h3>
                {expandedUser === user.Name && (
                  <div className="user-details">
                    <p><strong>Resource Group:</strong> {user.Resource_Group || 'N/A'}</p>
                    <p><strong>Subscription:</strong> {user.Subscription || 'N/A'}</p>
                    <p><strong>Location:</strong> {user.Location || 'N/A'}</p>
                    {resourceGroupLinks[user.Name] ? (
                      <a
                        href={resourceGroupLinks[user.Name]}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="azure-portal-link"
                        onClick={handleLinkClick} // Prevent collapsing box
                      >
                        Open Resource Group <ExternalLink size={12} style={{ marginLeft: 4 }} />
                      </a>
                    ) : (
                      <span className="no-link">(No direct link available)</span>
                    )}
                  </div>
                )}
              </div>
            ))}
            {/* Message if filter returns no results but search term exists */}
            {filteredUsers.length === 0 && searchTerm && users.length > 0 && (
              <p className="no-results-message">No users found matching "{searchTerm}".</p>
            )}
             {/* Message if users array is empty after load attempt (e.g., DB table empty) */}
             {users.length === 0 && !isLoading && apiStatus === 'connected' && (
                 <p className="no-results-message">No user data found in the database.</p>
             )}
          </div>
        </>
      );
    }

    // Fallback (should ideally not be reached if logic is correct)
    return <div className="container">Loading or unexpected state... Please wait or refresh.</div>;
  };


  // --- Render Component ---
  return (
    <div className="app-container">
      <header className="header">
        <h1>
          <Server size={32} style={{ marginRight: 12 }}/>
          Azure User Management [ITK24]
        </h1>
        {/* Show search bar only when users are loaded successfully */}
        {users.length > 0 && apiStatus === 'connected' && (
          <div className="search-container">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              placeholder="Search users by name..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search users by name"
              disabled={isLoading} // Disable search while loading
            />
          </div>
        )}
      </header>

      <main className="container">
        {renderContent()}
      </main>

      <footer className="footer">
        {/* Add footer content if needed */}
        <p>Status: {apiStatus} {isLoading ? '(Loading...)' : ''}</p>
      </footer>
    </div>
  );
}

export default App;