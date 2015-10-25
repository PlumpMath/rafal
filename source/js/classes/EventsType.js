var EventsType = {
	USER_CONNECTED: 'user-connected',
	USER_DISCONNECTED: 'user-disconnected',
	ALL_CONNECTED_PEERS_LIST: 'all-connected-peers-list'
};

if (typeof module !== 'undefined') {
  module.exports = EventsType;
}