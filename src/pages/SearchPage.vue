<template>
    <div class="container">
      <h1 class="page-title">
        <i class="fas fa-search me-2"></i>Search Recipes
      </h1>
      
      <div class="card mb-4">
        <div class="card-header">
          <h5 class="mb-0"><i class="fas fa-filter me-2"></i>Search Filters</h5>
        </div>
        <div class="card-body">
          <form @submit.prevent="search">
            <!-- Basic Search -->
            <div class="row mb-3">
              <div class="col-md-8">
                <label for="query" class="form-label">Search for recipes:</label>
                <input 
                  type="text" 
                  id="query" 
                  class="form-control" 
                  v-model="searchQuery"
                  placeholder="Enter recipe name, ingredients..."
                  required
                >
              </div>
              <div class="col-md-4">
                <label for="number" class="form-label">Number of results:</label>
                <select id="number" class="form-select" v-model="number">
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="15">15</option>
                </select>
              </div>
            </div>
  
            <!-- Advanced Filters -->
            <div class="row mb-3">
              <div class="col-md-4">
                <label for="cuisine" class="form-label">Cuisine:</label>
                <select id="cuisine" class="form-select" v-model="selectedCuisine">
                  <option value="">Any Cuisine</option>
                  <option value="african">African</option>
                  <option value="american">American</option>
                  <option value="british">British</option>
                  <option value="cajun">Cajun</option>
                  <option value="caribbean">Caribbean</option>
                  <option value="chinese">Chinese</option>
                  <option value="eastern european">Eastern European</option>
                  <option value="european">European</option>
                  <option value="french">French</option>
                  <option value="german">German</option>
                  <option value="greek">Greek</option>
                  <option value="indian">Indian</option>
                  <option value="irish">Irish</option>
                  <option value="italian">Italian</option>
                  <option value="japanese">Japanese</option>
                  <option value="jewish">Jewish</option>
                  <option value="korean">Korean</option>
                  <option value="latin american">Latin American</option>
                  <option value="mediterranean">Mediterranean</option>
                  <option value="mexican">Mexican</option>
                  <option value="middle eastern">Middle Eastern</option>
                  <option value="nordic">Nordic</option>
                  <option value="southern">Southern</option>
                  <option value="spanish">Spanish</option>
                  <option value="thai">Thai</option>
                  <option value="vietnamese">Vietnamese</option>
                </select>
              </div>
              
              <div class="col-md-4">
                <label for="diet" class="form-label">Diet:</label>
                <select id="diet" class="form-select" v-model="selectedDiet">
                  <option value="">Any Diet</option>
                  <option value="gluten free">Gluten Free</option>
                  <option value="ketogenic">Ketogenic</option>
                  <option value="vegetarian">Vegetarian</option>
                  <option value="lacto-vegetarian">Lacto-Vegetarian</option>
                  <option value="ovo-vegetarian">Ovo-Vegetarian</option>
                  <option value="vegan">Vegan</option>
                  <option value="pescetarian">Pescetarian</option>
                  <option value="paleo">Paleo</option>
                  <option value="primal">Primal</option>
                  <option value="whole30">Whole30</option>
                </select>
              </div>
              
              <div class="col-md-4">
                <label for="intolerances" class="form-label">Intolerances:</label>
                <select id="intolerances" class="form-select" v-model="selectedIntolerances">
                  <option value="">No Restrictions</option>
                  <option value="dairy">Dairy</option>
                  <option value="egg">Egg</option>
                  <option value="gluten">Gluten</option>
                  <option value="grain">Grain</option>
                  <option value="peanut">Peanut</option>
                  <option value="seafood">Seafood</option>
                  <option value="sesame">Sesame</option>
                  <option value="shellfish">Shellfish</option>
                  <option value="soy">Soy</option>
                  <option value="sulfite">Sulfite</option>
                  <option value="tree nut">Tree Nut</option>
                  <option value="wheat">Wheat</option>
                </select>
              </div>
            </div>
  
            <!-- Search Button -->
            <div class="d-flex justify-content-between align-items-center">
              <button type="button" @click="clearFilters" class="btn btn-outline-secondary">
                <i class="fas fa-undo me-1"></i>Clear Filters
              </button>
              <button type="submit" class="btn btn-primary" :disabled="loading">
                <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                <i v-else class="fas fa-search me-1"></i>
                {{ loading ? 'Searching...' : 'Search Recipes' }}
              </button>
            </div>
          </form>
        </div>
      </div>
  
      <!-- Search Results -->
      <div v-if="hasSearched">
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
        
        <div v-else-if="recipes.length === 0" class="text-center py-5">
          <i class="fas fa-search display-1 text-muted mb-3"></i>
          <h3>No recipes found</h3>
          <p class="text-muted">Try adjusting your search criteria or filters.</p>
        </div>
        
        <RecipePreviewList 
          v-else 
          :title="`Search Results (${recipes.length} found)`" 
          :recipes="recipes" 
          @favorite-changed="handleFavoriteChanged"
        />
      </div>
      
      <!-- Welcome message for first visit -->
      <div v-else class="text-center py-5">
        <i class="fas fa-utensils display-1 text-muted mb-3"></i>
        <h3>Find Your Perfect Recipe</h3>
        <p class="text-muted">Use the search filters above to discover amazing recipes from around the world!</p>
      </div>
    </div>
  </template>
    
  <script>
  import RecipePreviewList from "../components/RecipePreviewList.vue";
  import axios from "axios";
  import store from "../store";
  
  export default {
    name: "SearchPage",
    components: {
      RecipePreviewList,
    },
    data() {
      return {
        searchQuery: '',
        number: 5,
        selectedCuisine: '',
        selectedDiet: '',
        selectedIntolerances: '',
        recipes: [],
        loading: false,
        hasSearched: false
      };
    },
    methods: {
      async search() {
        if (!this.searchQuery.trim()) {
          window.toast("Info", "Please enter a search query.", "info");
          return;
        }
        
        this.loading = true;
        this.hasSearched = true;
        
        try {
          const params = {
            query: this.searchQuery,
            number: this.number,
          };
          
          // Add optional filters only if they have values
          if (this.selectedCuisine) {
            params.cuisine = this.selectedCuisine;
          }
          if (this.selectedDiet) {
            params.diet = this.selectedDiet;
          }
          if (this.selectedIntolerances) {
            params.intolerances = this.selectedIntolerances;
          }
          
          const response = await axios.get(`${store.server_domain}/recipes/search`, {
            params: params
          });
          
          this.recipes = response.data.map(r => ({ 
            ...r, 
            isSpoonacular: true,
            isFavorite: false // Will be updated by favorites check if user is logged in
          }));
          
          // If user is logged in, check which recipes are favorites
          if (store.username) {
            await this.checkFavorites();
          }
          
          window.toast("Success", `Found ${this.recipes.length} recipes!`, "success");
        } catch (error) {
          console.error(error);
          window.toast("Error", "Search failed. Please try again.", "danger");
          this.recipes = [];
        } finally {
          this.loading = false;
        }
      },
      
      async checkFavorites() {
        try {
          const response = await axios.get(`${store.server_domain}/users/favorites`);
          const favorites = response.data;
          
          this.recipes = this.recipes.map(recipe => ({
            ...recipe,
            isFavorite: favorites.some(fav => fav.id == recipe.id && fav.isSpoonacular)
          }));
        } catch (error) {
          console.error('Failed to check favorites:', error);
        }
      },
      
      handleFavoriteChanged(event) {
        const { recipeId, isFavorite } = event;
        const recipe = this.recipes.find(r => r.id === recipeId);
        if (recipe) {
          recipe.isFavorite = isFavorite;
        }
      },
      
      clearFilters() {
        this.searchQuery = '';
        this.selectedCuisine = '';
        this.selectedDiet = '';
        this.selectedIntolerances = '';
        this.number = 5;
        this.recipes = [];
        this.hasSearched = false;
      }
    },
  };
  </script>
  
  <style scoped>
  .page-title {
    color: #2c3e50;
    font-weight: 600;
    margin-bottom: 2rem;
  }
  
  .card-header {
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    border-bottom: 1px solid #dee2e6;
  }
  
  .form-label {
    font-weight: 600;
    color: #495057;
  }
  
  .btn {
    font-weight: 500;
  }
  
  @media (max-width: 768px) {
    .row.mb-3 > .col-md-4,
    .row.mb-3 > .col-md-8 {
      margin-bottom: 1rem;
    }
  }
  </style>
