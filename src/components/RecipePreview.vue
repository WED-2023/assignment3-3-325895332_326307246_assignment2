<template>
  <div class="recipe-card">
    <router-link
      :to="{ name: 'recipe', params: { recipeId: recipe.id }, query: { source: recipe.isSpoonacular ? 'spoon' : 'db' } }"
      class="recipe-preview-link"
    >
      <div class="modern-recipe-card">
        <!-- Image Section -->
        <div class="recipe-image-container">
          <img
            v-if="recipe.image"
            :src="recipe.image"
            class="recipe-image"
            alt="Recipe image"
          />
          <div v-else class="recipe-image-placeholder">
            <i class="fas fa-utensils"></i>
          </div>
          
          <!-- Badges Overlay -->
          <div class="recipe-badges">
            <span v-if="recipe.vegan" class="badge badge-vegan">
              <i class="fas fa-leaf"></i>
            </span>
            <span v-if="recipe.vegetarian && !recipe.vegan" class="badge badge-vegetarian">
              <i class="fas fa-carrot"></i>
            </span>
            <span v-if="recipe.glutenFree" class="badge badge-gluten-free">
              <i class="fas fa-wheat"></i>
            </span>
          </div>

          <!-- Favorite Action -->
          <div v-if="store?.username && showActions" class="favorite-action">
            <button 
              @click.prevent="toggleFavorite" 
              class="favorite-btn"
              :class="{ 'active': isFavorite }"
            >
              <i class="fas fa-heart"></i>
            </button>
          </div>
        </div>
        
        <!-- Content Section -->
        <div class="recipe-content">
          <h6 class="recipe-title">{{ recipe.title }}</h6>
          
          <!-- Recipe Stats -->
          <div class="recipe-stats">
            <div class="stat-item" v-if="recipe.readyInMinutes">
              <i class="fas fa-clock"></i>
              <span>{{ recipe.readyInMinutes }}m</span>
            </div>
            <div class="stat-item" v-if="recipe.servings">
              <i class="fas fa-users"></i>
              <span>{{ recipe.servings }}</span>
            </div>
            <div class="stat-item" v-if="recipe.aggregateLikes">
              <i class="fas fa-thumbs-up"></i>
              <span>{{ recipe.aggregateLikes }}</span>
            </div>
          </div>
          
          <!-- Source -->
          <div class="recipe-source">
            <i :class="recipe.isSpoonacular ? 'fas fa-globe' : 'fas fa-home'"></i>
            <span>{{ recipe.isSpoonacular ? 'Spoonacular' : 'My Recipe' }}</span>
            <span v-if="isFavorite" class="favorite-indicator">
              <i class="fas fa-heart"></i>
            </span>
          </div>
        </div>
      </div>
    </router-link>
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
  margin-bottom: 1rem;
}

.recipe-preview-link {
  text-decoration: none;
  color: inherit;
  display: block;
}

.modern-recipe-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(0, 0, 0, 0.06);
  display: flex;
  min-height: 140px;
  max-height: 140px;

  &:hover {
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    transform: translateY(-3px);
    border-color: rgba(0, 123, 255, 0.2);
  }
}

/* Image Section */
.recipe-image-container {
  position: relative;
  width: 140px;
  min-width: 140px;
  flex-shrink: 0;
}

.recipe-image {
  width: 100%;
  height: 140px;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.modern-recipe-card:hover .recipe-image {
  transform: scale(1.05);
}

.recipe-image-placeholder {
  width: 100%;
  height: 140px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6c757d;
  font-size: 2rem;
}

/* Badges */
.recipe-badges {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  z-index: 2;
}

.badge {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  color: white;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.badge-vegan {
  background: linear-gradient(135deg, #28a745, #20c997);
}

.badge-vegetarian {
  background: linear-gradient(135deg, #17a2b8, #20c997);
}

.badge-gluten-free {
  background: linear-gradient(135deg, #ffc107, #fd7e14);
}

/* Favorite Action */
.favorite-action {
  position: absolute;
  top: 8px;
  left: 8px;
  z-index: 3;
}

.favorite-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  color: #6c757d;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  cursor: pointer;

  &:hover {
    background: white;
    transform: scale(1.1);
    color: #dc3545;
  }

  &.active {
    background: #dc3545;
    color: white;
    
    &:hover {
      background: #c82333;
    }
  }
}

/* Content Section */
.recipe-content {
  flex: 1;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-width: 0; /* Allow text to truncate */
}

.recipe-title {
  font-size: 1rem;
  font-weight: 600;
  line-height: 1.3;
  color: #2c3e50;
  margin: 0 0 0.75rem 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Recipe Stats */
.recipe-stats {
  display: flex;
  gap: 1rem;
  margin-bottom: 0.75rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  color: #6c757d;
  
  i {
    color: #007bff;
    width: 12px;
  }
  
  span {
    font-weight: 500;
  }
}

/* Source */
.recipe-source {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.7rem;
  color: #6c757d;
  padding-top: 0.5rem;
  border-top: 1px solid #e9ecef;
  
  i {
    margin-right: 0.25rem;
    color: #007bff;
  }
  
  span {
    font-weight: 500;
  }
}

.favorite-indicator {
  color: #dc3545;
  font-size: 0.8rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .modern-recipe-card {
    min-height: 120px;
    max-height: 120px;
  }
  
  .recipe-image-container {
    width: 120px;
    min-width: 120px;
  }
  
  .recipe-image,
  .recipe-image-placeholder {
    height: 120px;
  }
  
  .recipe-content {
    padding: 0.75rem;
  }
  
  .recipe-title {
    font-size: 0.9rem;
    margin-bottom: 0.5rem;
  }
  
  .recipe-stats {
    gap: 0.75rem;
    margin-bottom: 0.5rem;
  }
  
  .stat-item {
    font-size: 0.7rem;
  }
}

@media (max-width: 576px) {
  .modern-recipe-card {
    min-height: 100px;
    max-height: 100px;
  }
  
  .recipe-image-container {
    width: 100px;
    min-width: 100px;
  }
  
  .recipe-image,
  .recipe-image-placeholder {
    height: 100px;
  }
  
  .recipe-content {
    padding: 0.5rem;
  }
  
  .recipe-title {
    font-size: 0.85rem;
    -webkit-line-clamp: 1;
    line-clamp: 1;
  }
  
  .recipe-stats {
    gap: 0.5rem;
  }
  
  .favorite-btn {
    width: 28px;
    height: 28px;
    font-size: 0.8rem;
  }
  
  .badge {
    width: 20px;
    height: 20px;
    font-size: 0.6rem;
  }
}

/* Animation for better UX */
@keyframes heartBeat {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}

.favorite-btn.active {
  animation: heartBeat 0.3s ease;
}
</style>
