<template>
  <div class="container">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1 class="page-title">
        <i class="fas fa-home text-warning me-2"></i>Family Recipes
      </h1>
      <router-link :to="{ name: 'createRecipe', query: { family: 'true' } }" class="btn btn-success">
        <i class="fas fa-plus me-2"></i>Add Family Recipe
      </router-link>
    </div>
    
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>
    
    <div v-else-if="familyRecipes.length === 0" class="text-center py-5">
      <i class="fas fa-home display-1 text-muted mb-3"></i>
      <h3>No family recipes yet</h3>
      <p class="text-muted">Share your family's traditional recipes and preserve your culinary heritage!</p>
      <router-link :to="{ name: 'createRecipe', query: { family: 'true' } }" class="btn btn-success">
        <i class="fas fa-plus me-2"></i>Add Your First Family Recipe
      </router-link>
    </div>
    
    <RecipePreviewList v-else title="Your Family Heritage" :recipes="familyRecipes" />
  </div>
</template>

<script>
import RecipePreviewList from "../components/RecipePreviewList.vue";
import axios from "axios";
import store from "../store";

export default {
  name: "FamilyRecipesPage",
  components: {
    RecipePreviewList,
  },
  data() {
    return {
      familyRecipes: [],
      loading: true
    };
  },
  async created() {
    if (!store.username) {
      this.$router.push('/login');
      return;
    }
    
    try {
      const response = await axios.get(`${store.server_domain}/users/familyRecipes`);
      this.familyRecipes = response.data.map(r => ({
        ...r,
        isSpoonacular: false
      }));
    } catch (error) {
      console.error("Failed to load family recipes:", error);
      window.toast("Error", "Failed to load your family recipes.", "danger");
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
