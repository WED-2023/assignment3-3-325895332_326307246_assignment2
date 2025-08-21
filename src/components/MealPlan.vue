<template>
  <div class="meal-plan-widget card">
    <div class="card-header d-flex justify-content-between align-items-center">
      <h6 class="mb-0">
        <i class="fas fa-clipboard-list me-2"></i>Meal Plan
      </h6>
      <router-link :to="{ name: 'mealPlan' }" class="btn btn-sm btn-primary">
        View All
      </router-link>
    </div>
    <div class="card-body">
      <div v-if="mealPlan.length === 0" class="text-center text-muted py-3">
        <i class="fas fa-clipboard"></i>
        <p class="mb-0 mt-2">No recipes in meal plan</p>
      </div>
      <div v-else class="meal-plan-preview">
        <div 
          v-for="item in mealPlan.slice(0, 3)" 
          :key="item.id"
          class="meal-plan-item-preview d-flex align-items-center mb-2"
        >
          <img 
            :src="item.recipe.image || '/api/placeholder/40/40'" 
            :alt="item.recipe.title"
            class="recipe-thumb me-3"
            @error="$event.target.src='/api/placeholder/40/40'"
          >
          <div class="flex-grow-1">
            <div class="recipe-title-small">{{ item.recipe.title.slice(0, 30) }}...</div>
            <ProgressBar 
              :current="item.progress.currentStep"
              :total="item.progress.totalSteps"
              :height="8"
              class="mt-1"
            />
          </div>
        </div>
        <div v-if="mealPlan.length > 3" class="text-center mt-2">
          <small class="text-muted">+{{ mealPlan.length - 3 }} more recipes</small>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue';
import store from '../store';
import ProgressBar from './ProgressBar.vue';

export default {
  name: "MealPlan",
  components: {
    ProgressBar
  },
  setup() {
    const mealPlan = computed(() => store.mealPlan);
    
    return {
      mealPlan
    };
  }
};
</script>

<style scoped>
.meal-plan-widget {
  max-width: 100%;
}

.meal-plan-item-preview {
  padding: 0.5rem;
  border-radius: 8px;
  transition: background-color 0.2s;
}

.meal-plan-item-preview:hover {
  background-color: #f8f9fa;
}

.recipe-thumb {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: 6px;
}

.recipe-title-small {
  font-size: 0.875rem;
  font-weight: 500;
  color: #495057;
  line-height: 1.2;
}
</style>