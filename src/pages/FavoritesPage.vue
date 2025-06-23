<template>
  <div class="container">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1 class="page-title">
        <i class="fas fa-heart text-danger me-2"></i>My Favorite Recipes
      </h1>
    </div>
    
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>
    
    <div v-else-if="favoriteRecipes.length === 0" class="text-center py-5">
      <i class="fas fa-heart-broken display-1 text-muted mb-3"></i>
      <h3>No favorite recipes yet</h3>
      <p class="text-muted">Start exploring recipes and add them to your favorites!</p>
      <router-link :to="{ name: 'search' }" class="btn btn-primary">
        <i class="fas fa-search me-2"></i>Search Recipes
      </router-link>
    </div>
    
    <RecipePreviewList v-else title="Your Favorite Recipes" :recipes="favoriteRecipes" />
  </div>
</template>

<script>
import RecipePreviewList from "../components/RecipePreviewList.vue";
import axios from "axios";
import store from "../store";

export default {
  name: "FavoritesPage",
  components: {
    RecipePreviewList,
  },
  data() {
    return {
      favoriteRecipes: [],
      loading: true
    };
  },
  async created() {
    if (!store.username) {
      this.$router.push('/login');
      return;
    }
    
    try {
      const response = await axios.get(`${store.server_domain}/users/favorites`);
      this.favoriteRecipes = response.data.map(r => ({
        ...r,
        isSpoonacular: r.source !== 'db'
      }));
    } catch (error) {
      console.error("Failed to load favorite recipes:", error);
      window.toast("Error", "Failed to load your favorite recipes.", "danger");
    } finally {
      this.loading = false;
    }
  }
};
</script>

<style scoped>
.page-title {
  color: #2c3e50;
  font-weight: 600;
}
</style>
