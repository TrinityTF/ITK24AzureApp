import { useState, useEffect } from 'react';
import axios from 'axios';
import { Server, Search, Trash2, ExternalLink } from 'lucide-react';
import './App.css';

function App() {
  const [isConnected, setIsConnected] = useState(null);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [expandedUser, setExpandedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Azure Portal Resource Group Links
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
  };

  useEffect(() => {
    checkConnection();
  }, []);

  useEffect(() => {
    if (users.length > 0) {
      const filtered = users.filter(user => 
        user.Name.toLowerCase().startsWith(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [searchTerm, users]);

  const checkConnection = async () => {
    try {
      const response = await axios.get('https://40.127.132.55:443/check-connection');
      setIsConnected(response.data.connected);
    } catch (error) {
      setIsConnected(false);
    }
  };

  const handleOkClick = async () => {
    try {
      const response = await axios.get('https://40.127.132.55:443/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const openAzurePortal = () => {
    window.open('https://portal.azure.com/#@followercase.com/resource/subscriptions/531371bc-4ac6-4729-a4fe-8ded1d4fedce/resourceGroups/ITK24-AguToomasPihelgas/overview', '_blank');
  };

  if (isConnected === null) return <div className="container">Checking connection...</div>;
  
  if (!isConnected) {
    return (
      <div className="app-container">
        <div className="container">
          <h2>Azure VM is offline. Please start the VM to use this application.</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="header">
        <h1>
          <Server size={32} />
          Azure User Management [ITK24]
        </h1>
        {users.length > 0 && (
          <div className="search-container">
            <Search size={20} style={{marginRight: 10, color: '#0078D4'}} />
            <input 
              type="text" 
              placeholder="Search users..." 
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        )}
      </div>

      <div className="container">
        {users.length === 0 ? (
          <div className="connection-box">
            <h2>Connection Established</h2>
            <button onClick={handleOkClick}>Load Users</button>
          </div>
        ) : (
          <>
            <div className="delete-services-box">
              <div className="delete-services-content">
                <Trash2 size={32} color="#DC3545" />
                <div className="delete-services-text">
                  <h3>Delete Agu's Azure Services</h3>
                </div>
                <button 
                  className="delete-services-button"
                  onClick={openAzurePortal}
                >
                  Open Azure Portal <ExternalLink size={16} style={{marginLeft: 8}} />
                </button>
              </div>
            </div>
            <div className="user-list">
              {filteredUsers.map((user) => (
                <div 
                  key={user.Name} 
                  className={`user-box ${expandedUser === user.Name ? 'expanded' : ''}`}
                  onClick={() => setExpandedUser(expandedUser === user.Name ? null : user.Name)}
                >
                  <h3>{user.Name}</h3>
                  {expandedUser === user.Name && (
                    <div className="user-details">
                      <p>Resource Group: {user.Resource_Group}</p>
                      <p>Subscription: {user.Subscription}</p>
                      <p>Location: {user.Location}</p>
                      {resourceGroupLinks[user.Name] && (
                        <a 
                          href={resourceGroupLinks[user.Name]} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="azure-portal-link"
                        >
                          Open Resource Group <ExternalLink size={12} style={{marginLeft: 4}} />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;