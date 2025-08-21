<template>
  <div class="container">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1 class="page-title">
        <i class="fas fa-utensils me-2"></i>My Meal Plan
      </h1>
      <div class="meal-plan-actions">
        <button 
          v-if="mealPlan.length > 0" 
          class="btn btn-outline-danger me-2" 
          @click="clearAllMealPlan"
        >
          <i class="fas fa-trash me-1"></i>Clear All
        </button>
        <span class="badge bg-primary fs-6">{{ mealPlan.length }} recipes</span>
      </div>
    </div>

    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <div v-else-if="mealPlan.length === 0" class="text-center py-5">
      <i class="fas fa-clipboard-list display-1 text-muted mb-3"></i>
      <h3>Your meal plan is empty</h3>
      <p class="text-muted">Start adding recipes to your meal plan from the recipe pages!</p>
      <router-link :to="{ name: 'search' }" class="btn btn-primary">
        <i class="fas fa-search me-1"></i>Browse Recipes
      </router-link>
    </div>

    <div v-else class="meal-plan-list">
      <div 
        v-for="(item, index) in sortedMealPlan" 
        :key="item.id"
        class="meal-plan-item card mb-3"
      >
        <div class="card-body">
          <div class="row align-items-center">
            <!-- Order Controls -->
            <div class="col-auto">
              <div class="order-controls">
                <div class="order-number">{{ item.order }}</div>
                <div class="order-buttons">
                  <button 
                    class="btn btn-sm btn-outline-secondary"
                    @click="moveUp(item.id)"
                    :disabled="index === 0"
                  >
                    <i class="fas fa-chevron-up"></i>
                  </button>
                  <button 
                    class="btn btn-sm btn-outline-secondary"
                    @click="moveDown(item.id)"
                    :disabled="index === sortedMealPlan.length - 1"
                  >
                    <i class="fas fa-chevron-down"></i>
                  </button>
                </div>
              </div>
            </div>

            <!-- Recipe Info (Clickable) -->
            <div class="col recipe-info-section" @click="viewRecipe(item.recipe)">
              <div class="recipe-content d-flex align-items-center">
                <!-- Recipe Image -->
                <div class="recipe-image-container me-3">
                  <img 
                    :src="item.recipe.image || '/api/placeholder/80/80'" 
                    :alt="item.recipe.title"
                    class="recipe-image"
                    @error="$event.target.src='/api/placeholder/80/80'"
                  >
                </div>

                <!-- Recipe Details -->
                <div class="recipe-details flex-grow-1">
                  <h5 class="recipe-title mb-1">{{ item.recipe.title }}</h5>
                  <p class="text-muted mb-2">
                    Added {{ formatDate(item.addedAt) }}
                    <span v-if="item.recipe.readyInMinutes" class="ms-2">
                      <i class="fas fa-clock"></i> {{ item.recipe.readyInMinutes }} min
                    </span>
                    <span v-if="item.currentServings" class="ms-2">
                      <i class="fas fa-users"></i> {{ item.currentServings }} servings
                    </span>
                  </p>

                  <!-- Progress Bar -->
                  <ProgressBar 
                    :current="item.progress.currentStep"
                    :total="item.progress.totalSteps"
                    :label="`Cooking Progress`"
                    :height="20"
                    :show-percentage="true"
                  />

                  <div class="recipe-status mt-2">
                    <span 
                      v-if="item.progress.isCompleted" 
                      class="badge bg-success status-badge"
                    >
                      <i class="fas fa-check"></i> Completed
                    </span>
                    <span 
                      v-else-if="item.progress.startedCooking" 
                      class="badge bg-warning text-dark status-badge status-badge-small"
                    >
                      <i class="fas fa-play"></i> In Progress
                    </span>
                    <span 
                      v-else 
                      class="badge bg-secondary status-badge"
                    >
                      <i class="fas fa-pause"></i> Not Started
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="col-auto">
              <div class="action-buttons">
                <button 
                  class="btn btn-success btn-sm me-2"
                  @click.stop="startCookingMode(item.recipe)"
                  title="Start Cooking"
                >
                  <i class="fas fa-play"></i>
                </button>
                <button 
                  class="btn btn-outline-danger btn-sm"
                  @click.stop="removeItem(item.id)"
                  title="Remove from meal plan"
                >
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import store from '../store';
import ProgressBar from '../components/ProgressBar.vue';

export default {
  name: "MealPlanPage",
  components: {
    ProgressBar
  },
  setup() {
    const router = useRouter();
    const loading = ref(false);

    const mealPlan = computed(() => store.mealPlan);
    
    const sortedMealPlan = computed(() => {
      return [...mealPlan.value].sort((a, b) => a.order - b.order);
    });

    onMounted(() => {
      if (!store.username) {
        router.push('/login');
        return;
      }
    });

    const formatDate = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const moveUp = (itemId) => {
      const currentIndex = sortedMealPlan.value.findIndex(item => item.id === itemId);
      if (currentIndex > 0) {
        const currentItem = sortedMealPlan.value[currentIndex];
        const previousItem = sortedMealPlan.value[currentIndex - 1];
        
        // Swap orders
        const tempOrder = currentItem.order;
        store.updateMealPlanItemOrder(currentItem.id, previousItem.order);
        store.updateMealPlanItemOrder(previousItem.id, tempOrder);
      }
    };

    const moveDown = (itemId) => {
      const currentIndex = sortedMealPlan.value.findIndex(item => item.id === itemId);
      if (currentIndex < sortedMealPlan.value.length - 1) {
        const currentItem = sortedMealPlan.value[currentIndex];
        const nextItem = sortedMealPlan.value[currentIndex + 1];
        
        // Swap orders
        const tempOrder = currentItem.order;
        store.updateMealPlanItemOrder(currentItem.id, nextItem.order);
        store.updateMealPlanItemOrder(nextItem.id, tempOrder);
      }
    };

    const removeItem = (itemId) => {
      if (confirm('Are you sure you want to remove this recipe from your meal plan?')) {
        store.removeFromMealPlan(itemId);
        window.toast("Success", "Recipe removed from meal plan", "success");
      }
    };

    const clearAllMealPlan = () => {
      if (confirm('Are you sure you want to clear your entire meal plan? This cannot be undone.')) {
        store.clearMealPlan();
        window.toast("Success", "Meal plan cleared", "success");
      }
    };

    const viewRecipe = (recipe) => {
      const source = recipe.isSpoonacular ? 'spoon' : 'db';
      router.push({
        name: 'recipe',
        params: { recipeId: recipe.id },
        query: { source }
      });
    };

    const startCookingMode = (recipe) => {
      const source = recipe.isSpoonacular ? 'spoon' : 'db';
      router.push({
        name: 'cookingMode',
        params: { recipeId: recipe.id },
        query: { source }
      });
    };

    return {
      loading,
      mealPlan,
      sortedMealPlan,
      formatDate,
      moveUp,
      moveDown,
      removeItem,
      clearAllMealPlan,
      viewRecipe,
      startCookingMode
    };
  }
};
</script>

<style scoped>
.page-title {
  color: #2c3e50;
  font-weight: 600;
}

.meal-plan-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.meal-plan-item {
  border: 1px solid #e9ecef;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.meal-plan-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.order-controls {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.order-number {
  width: 30px;
  height: 30px;
  background: #007bff;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.9rem;
}

.order-buttons {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.order-buttons .btn {
  padding: 2px 6px;
  line-height: 1;
}

.recipe-info-section {
  cursor: pointer;
}

.recipe-info-section:hover .recipe-title {
  color: #007bff;
}

.recipe-content {
  width: 100%;
}

.recipe-image-container {
  position: relative;
  width: 80px;
  min-width: 80px;
  flex-shrink: 0;
}

.recipe-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
}

.recipe-details {
  min-width: 0; /* Allow flex item to shrink */
}

.recipe-title {
  font-weight: 600;
  color: #2c3e50;
  transition: color 0.2s ease;
}

.recipe-status .badge {
  font-size: 0.75rem;
  position: static;
  box-shadow: none;
  padding: 4px 8px;
}

.status-badge {
  font-size: 0.75rem !important;
  padding: 4px 8px !important;
}

.status-badge-small {
  font-size: 0.65rem !important;
  padding: 3px 6px !important;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.action-buttons .btn {
  min-width: 40px;
}

@media (max-width: 768px) {
  .meal-plan-item .row {
    flex-wrap: wrap;
  }
  
  .col-auto:last-child {
    margin-top: 1rem;
  }
  
  .action-buttons {
    flex-direction: row;
    justify-content: center;
  }
  
  .order-controls {
    flex-direction: row;
    align-items: center;
  }
  
  .order-buttons {
    flex-direction: row;
  }
  
  .status-badge {
    font-size: 0.7rem !important;
    padding: 3px 6px !important;
  }

  .status-badge-small {
    font-size: 0.6rem !important;
    padding: 2px 5px !important;
  }
}

@media (min-width: 769px) {
}
</style>
