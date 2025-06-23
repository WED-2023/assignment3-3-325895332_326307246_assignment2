<template>
  <div class="recipe-card">
    <router-link
      :to="{ name: 'recipe', params: { recipeId: recipe.id }, query: { source: recipe.isSpoonacular ? 'spoon' : 'db' } }"
      class="recipe-preview-link"
    >
      <div class="card h-100 recipe-card-hover">
        <div class="position-relative">
          <img
            v-if="recipe.image"
            :src="recipe.image"
            class="card-img-top recipe-image"
            alt="Recipe image"
          />
          <div v-else class="recipe-image-placeholder d-flex align-items-center justify-content-center">
            <i class="fas fa-utensils fa-3x text-muted"></i>
          </div>
          
          <!-- Recipe badges -->
          <div class="recipe-badges position-absolute top-0 end-0 m-2">
            <span v-if="recipe.vegan" class="badge bg-success mb-1 d-block">
              <i class="fas fa-leaf me-1"></i>Vegan
            </span>
            <span v-if="recipe.vegetarian && !recipe.vegan" class="badge bg-info mb-1 d-block">
              <i class="fas fa-carrot me-1"></i>Vegetarian
            </span>
            <span v-if="recipe.glutenFree" class="badge bg-warning mb-1 d-block">
              <i class="fas fa-wheat me-1"></i>GF
            </span>
          </div>
        </div>
        
        <div class="card-body d-flex flex-column">
          <h5 class="card-title recipe-title">{{ recipe.title }}</h5>
          
          <div class="recipe-meta mt-auto">
            <div class="d-flex justify-content-between align-items-center text-muted small mb-2">
              <span v-if="recipe.readyInMinutes">
                <i class="fas fa-clock me-1"></i>{{ recipe.readyInMinutes }} min
              </span>
              <span v-if="recipe.aggregateLikes">
                <i class="fas fa-thumbs-up me-1"></i>{{ recipe.aggregateLikes }}
              </span>
              <span v-if="recipe.servings">
                <i class="fas fa-users me-1"></i>{{ recipe.servings }}
              </span>
            </div>
            
            <!-- Source indicator -->
            <div class="recipe-source d-flex justify-content-between align-items-center">
              <small class="text-muted">
                <i :class="recipe.isSpoonacular ? 'fas fa-globe' : 'fas fa-home'" class="me-1"></i>
                {{ recipe.isSpoonacular ? 'Spoonacular' : 'My Recipe' }}
              </small>
              
              <!-- Favorite indicator -->
              <span v-if="isFavorite" class="text-danger">
                <i class="fas fa-heart"></i>
              </span>
            </div>
          </div>
        </div>
      </div>
    </router-link>
    
    <!-- Quick action buttons for logged-in users -->
    <div v-if="store?.username && showActions" class="recipe-actions position-absolute">
      <button 
        @click.prevent="toggleFavorite" 
        class="btn btn-sm btn-light rounded-circle shadow-sm"
        :class="{ 'text-danger': isFavorite }"
        :title="isFavorite ? 'Remove from favorites' : 'Add to favorites'"
      >
        <i class="fas fa-heart"></i>
      </button>
    </div>
  </div>
</template>

<script>
import { getCurrentInstance, ref, watch } from 'vue';
import axios from 'axios';

export default {
  name: "RecipePreview",
  props: {
    recipe: {
      type: Object,
      required: true
    },
    showActions: {
      type: Boolean,
      default: true
    }
  },
  emits: ['favorite-changed'],
  setup(props, { emit }) {
    const internalInstance = getCurrentInstance();
    const store = internalInstance?.appContext.config.globalProperties.store;
    
    // Create a reactive ref for favorite status to avoid mutating props
    const isFavorite = ref(props.recipe.isFavorite || false);
    
    // Watch for changes in the recipe prop and update local state
    watch(
      () => props.recipe.isFavorite,
      (newValue) => {
        isFavorite.value = newValue || false;
      },
      { immediate: true }
    );
    
    const toggleFavorite = async () => {
      if (!store?.username) {
        window.toast("Info", "Please login to add favorites", "info");
        return;
      }
      
      try {
        await axios.post(`${store.server_domain}/users/favorites`, {
          recipeId: props.recipe.id,
          isSpoonacular: props.recipe.isSpoonacular
        });
        
        // Update local state instead of mutating prop
        isFavorite.value = !isFavorite.value;
        
        // Emit event to parent component so it can update the original data
        emit('favorite-changed', {
          recipeId: props.recipe.id,
          isFavorite: isFavorite.value
        });
        
        const message = isFavorite.value ? 'Added to favorites' : 'Removed from favorites';
        window.toast("Success", message, "success");
      } catch (error) {
        console.error('Failed to toggle favorite:', error);
        window.toast("Error", "Failed to update favorites", "danger");
      }
    };
    
    return {
      store,
      isFavorite,
      toggleFavorite
    };
  }
}
</script>

<style scoped>
.recipe-card {
  position: relative;
  margin-bottom: 1.5rem;
}

.recipe-preview-link {
  text-decoration: none;
  color: inherit;
}

.recipe-card-hover {
  transition: all 0.3s ease;
  border: none;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.recipe-card-hover:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
}

.recipe-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.recipe-image-placeholder {
  width: 100%;
  height: 200px;
  background: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
}

.recipe-title {
  font-size: 1.1rem;
  font-weight: 600;
  line-height: 1.3;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.recipe-badges {
  z-index: 2;
}

.recipe-badges .badge {
  font-size: 0.7rem;
  text-shadow: none;
}

.recipe-meta {
  font-size: 0.875rem;
}

.recipe-actions {
  top: 10px;
  left: 10px;
  z-index: 3;
}

.recipe-actions .btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #dee2e6;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(5px);
  transition: all 0.2s ease;
}

.recipe-actions .btn:hover {
  transform: scale(1.1);
  background: white;
}

.recipe-source {
  border-top: 1px solid #e9ecef;
  padding-top: 0.5rem;
}

@media (max-width: 576px) {
  .recipe-image,
  .recipe-image-placeholder {
    height: 180px;
  }
  
  .recipe-title {
    font-size: 1rem;
  }
}
</style>
