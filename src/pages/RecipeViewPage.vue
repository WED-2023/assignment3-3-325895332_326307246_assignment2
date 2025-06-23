<template>
  <div class="container">
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>
    
    <div v-else-if="recipe" class="row">
      <div class="col-lg-8">
        <div class="card mb-4">
          <img v-if="recipe.image" :src="recipe.image" class="card-img-top recipe-hero-image" :alt="recipe.title">
          <div class="card-body">
            <h1 class="card-title">{{ recipe.title }}</h1>
            <div class="recipe-meta d-flex flex-wrap gap-3 mb-3">
              <span class="badge bg-primary">
                <i class="fas fa-clock me-1"></i>{{ recipe.readyInMinutes }} min
              </span>
              <span class="badge bg-info">
                <i class="fas fa-users me-1"></i>{{ recipe.servings }} servings
              </span>
              <span v-if="recipe.vegan" class="badge bg-success">
                <i class="fas fa-leaf me-1"></i>Vegan
              </span>
              <span v-if="recipe.vegetarian" class="badge bg-success">
                <i class="fas fa-carrot me-1"></i>Vegetarian
              </span>
              <span v-if="recipe.glutenFree" class="badge bg-warning">
                <i class="fas fa-wheat me-1"></i>Gluten Free
              </span>
            </div>
            
            <div class="recipe-actions mb-4" v-if="store.username">
              <button @click="toggleFavorite" class="btn me-2" :class="recipe.isFavorite ? 'btn-danger' : 'btn-outline-danger'">
                <i class="fas fa-heart me-1"></i>
                {{ recipe.isFavorite ? 'Remove from Favorites' : 'Add to Favorites' }}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div class="col-lg-4">
        <div class="card mb-4">
          <div class="card-header">
            <h5><i class="fas fa-list me-2"></i>Ingredients</h5>
          </div>
          <div class="card-body">
            <ul class="list-unstyled">
              <li v-for="(ingredient, index) in recipe.ingredients" :key="index" class="mb-2">
                <i class="fas fa-check-circle text-success me-2"></i>{{ ingredient }}
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      <div class="col-12">
        <div class="card">
          <div class="card-header">
            <h5><i class="fas fa-clipboard-list me-2"></i>Instructions</h5>
          </div>
          <div class="card-body">
            <ol class="instructions-list">
              <li v-for="(instruction, index) in recipe.instructions" :key="index" class="mb-3">
                {{ instruction }}
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
    
    <div v-else class="text-center py-5">
      <h2>Recipe not found</h2>
      <router-link to="/" class="btn btn-primary">Go Back Home</router-link>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, getCurrentInstance } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';

export default {
  name: "RecipeViewPage",
  setup() {
    const route = useRoute();
    const internalInstance = getCurrentInstance();
    const store = internalInstance.appContext.config.globalProperties.store;
    
    const recipe = ref(null);
    const loading = ref(true);
    
    const fetchRecipe = async () => {
      try {
        const { recipeId } = route.params;
        const source = route.query.source || 'spoon';
        
        const response = await axios.get(`${store.server_domain}/recipes/${recipeId}?source=${source}`);
        recipe.value = response.data;
      } catch (error) {
        console.error('Failed to fetch recipe:', error);
        window.toast("Error", "Failed to load recipe", "danger");
      } finally {
        loading.value = false;
      }
    };
    
    const toggleFavorite = async () => {
      if (!store.username) {
        window.toast("Info", "Please login to add favorites", "info");
        return;
      }
      
      try {
        const isSpoonacular = route.query.source === 'spoon';
        await axios.post(`${store.server_domain}/users/favorites`, {
          recipeId: recipe.value.id,
          isSpoonacular
        });
        
        recipe.value.isFavorite = !recipe.value.isFavorite;
        const message = recipe.value.isFavorite ? 'Added to favorites' : 'Removed from favorites';
        window.toast("Success", message, "success");
      } catch (error) {
        console.error('Failed to toggle favorite:', error);
        window.toast("Error", "Failed to update favorites", "danger");
      }
    };
    
    onMounted(fetchRecipe);
    
    return {
      recipe,
      loading,
      store,
      toggleFavorite
    };
  }
};
</script>

<style scoped>
.recipe-hero-image {
  height: 400px;
  object-fit: cover;
}

.recipe-meta .badge {
  font-size: 0.9rem;
  padding: 0.5rem 0.75rem;
}

.instructions-list li {
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #007bff;
}

.recipe-actions .btn {
  font-weight: 500;
}
</style>
