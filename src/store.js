import { reactive } from 'vue';
import axios from 'axios';

const store = reactive({
  username: localStorage.getItem('username'),
  server_domain: "http://localhost:3000",

  login(username) {
    localStorage.setItem('username', username);
    this.username = username;
  },

  async logout() {
    try {
      await axios.post(`${this.server_domain}/logout`);
    } catch (error) {
      console.error("Logout failed on server:", error);
    }
    localStorage.removeItem('username');
    this.username = undefined;
  }
});

export default store;
