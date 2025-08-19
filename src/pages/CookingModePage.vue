<template>
  <div class="container-fluid cooking-mode-container">
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>
    
    <div v-else-if="recipe" class="cooking-mode">
      <!-- Header -->
      <div class="cooking-header sticky-top bg-white border-bottom py-3 mb-4">
        <div class="row align-items-center">
          <div class="col-md-8">
            <h2 class="mb-0">{{ recipe.title }}</h2>
            <div class="text-muted">
              <i class="fas fa-clock me-1"></i>{{ recipe.readyInMinutes }} min
              <span class="mx-2">•</span>
              <i class="fas fa-users me-1"></i>{{ recipe.servings }} servings
              <span class="mx-2">•</span>
              Step {{ currentStep + 1 }} of {{ recipe.totalSteps }}
            </div>
          </div>
          <div class="col-md-4 text-md-end">
            <button @click="exitCookingMode" class="btn btn-outline-secondary me-2">
              <i class="fas fa-times me-1"></i>Exit Cooking Mode
            </button>
            <div class="serving-controls d-inline-flex align-items-center">
              <label class="me-2 small">Servings:</label>
              <button @click="adjustServings(-0.5)" class="btn btn-sm btn-outline-primary" :disabled="servingMultiplier <= 0.5">
                <i class="fas fa-minus"></i>
              </button>
              <span class="mx-2 fw-bold">{{ recipe.servings }}</span>
              <button @click="adjustServings(0.5)" class="btn btn-sm btn-outline-primary" :disabled="servingMultiplier >= 5">
                <i class="fas fa-plus"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Progress Bar -->
      <ProgressBar 
        :current="currentStep + 1" 
        :total="recipe.totalSteps" 
        class="mb-4"
      />

      <!-- Main Content -->
      <div class="row">
        <!-- Ingredients Panel -->
        <div class="col-lg-4 mb-4">
          <div class="card h-100 ingredients-panel">
            <div class="card-header">
              <h5 class="mb-0">
                <i class="fas fa-list me-2"></i>Ingredients
                <small class="text-muted">({{ recipe.servings }} servings)</small>
              </h5>
            </div>
            <div class="card-body">
              <div class="ingredients-list">
                <div 
                  v-for="(ingredient, index) in recipe.ingredients" 
                  :key="index" 
                  class="ingredient-item d-flex align-items-start mb-2"
                >
                  <div class="form-check me-2">
                    <input 
                      class="form-check-input" 
                      type="checkbox" 
                      :id="`ingredient-${index}`"
                      v-model="checkedIngredients[index]"
                    >
                  </div>
                  <label 
                    :for="`ingredient-${index}`" 
                    class="ingredient-text"
                    :class="{ 'text-decoration-line-through text-muted': checkedIngredients[index] }"
                  >
                    {{ typeof ingredient === 'string' ? ingredient : `${ingredient.quantity} ${ingredient.name}` }}
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Instructions Panel -->
        <div class="col-lg-8">
          <div class="card instructions-panel">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h5 class="mb-0">
                <i class="fas fa-clipboard-list me-2"></i>Instructions
              </h5>
              <div class="step-navigation">
                <button 
                  @click="previousStep" 
                  class="btn btn-sm btn-outline-primary me-2" 
                  :disabled="currentStep === 0"
                >
                  <i class="fas fa-chevron-left"></i> Previous
                </button>
                
                <button 
                  v-if="currentStep < recipe.totalSteps - 1"
                  @click="nextStep" 
                  class="btn btn-sm btn-primary"
                >
                  Next <i class="fas fa-chevron-right"></i>
                </button>
                
                <button 
                  v-else
                  @click="finishCooking" 
                  class="btn btn-sm btn-success"
                >
                  <i class="fas fa-check"></i> Finish Cooking
                </button>
              </div>
            </div>
            <div class="card-body">
              <!-- All Steps Preview -->
              <div class="steps-overview mb-4">
                <div 
                  v-for="(instruction, index) in recipe.instructions" 
                  :key="index"
                  class="step-preview"
                  :class="{
                    'active': index === currentStep,
                    'completed': index < currentStep,
                    'upcoming': index > currentStep
                  }"
                  @click="goToStep(index)"
                >
                  <div class="step-number">{{ index + 1 }}</div>
                  <div class="step-text">{{ instruction }}</div>
                </div>
              </div>

              <!-- Current Step Detail -->
              <div class="current-step-detail">
                <div class="step-header">
                  <span class="step-badge">Step {{ currentStep + 1 }}</span>
                </div>
                <div class="step-instruction">
                  {{ recipe.instructions[currentStep] }}
                </div>
                <div class="step-actions mt-4">
                  <div class="form-check">
                    <input 
                      class="form-check-input" 
                      type="checkbox" 
                      :id="`step-${currentStep}`"
                      v-model="completedSteps[currentStep]"
                    >
                    <label :for="`step-${currentStep}`" class="form-check-label">
                      Mark this step as completed
                    </label>
                  </div>
                </div>
              </div>

              <!-- Completion -->
              <div v-if="currentStep === recipe.totalSteps - 1 && completedSteps[currentStep]" class="completion-message mt-4">
                <div class="alert alert-success text-center">
                  <i class="fas fa-check-circle me-2"></i>
                  Congratulations! You've completed cooking {{ recipe.title }}!
                  <div class="mt-2">
                    <button @click="finishCooking" class="btn btn-success me-2">
                      <i class="fas fa-check me-1"></i>Finish & Clear Progress
                    </button>
                    <button @click="exitCookingMode" class="btn btn-outline-primary">
                      <i class="fas fa-arrow-left me-1"></i>Exit (Keep Progress)
                    </button>
                  </div>
                </div>
              </div>
            </div>
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
import { ref, reactive, onMounted, onUnmounted, watch, getCurrentInstance } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import ProgressBar from '../components/ProgressBar.vue';

export default {
  name: "CookingModePage",
  components: {
    ProgressBar
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const internalInstance = getCurrentInstance();
    const store = internalInstance.appContext.config.globalProperties.store;
    
    const recipe = ref(null);
    const loading = ref(true);
    const currentStep = ref(0);
    const servingMultiplier = ref(1);
    const checkedIngredients = reactive({});
    const completedSteps = reactive({});
    
    // Auto-save interval
    let autoSaveInterval = null;
    const AUTO_SAVE_INTERVAL = 10000; // Save every 10 seconds
    
    const getProgressKey = () => {
      const { recipeId } = route.params;
      const source = route.query.source || 'spoon';
      return { recipeId, source };
    };
    
    const loadProgress = async () => {
      try {
        const { recipeId, source } = getProgressKey();
        const response = await axios.get(`${store.server_domain}/recipes/${recipeId}/cooking-progress?source=${source}`);
        const progress = response.data;
        
        // Apply loaded progress
        currentStep.value = progress.currentStep || 0;
        servingMultiplier.value = progress.servingMultiplier || 1;
        
        // Clear existing reactive objects and populate with loaded data
        Object.keys(checkedIngredients).forEach(key => delete checkedIngredients[key]);
        Object.keys(completedSteps).forEach(key => delete completedSteps[key]);
        
        Object.assign(checkedIngredients, progress.checkedIngredients || {});
        Object.assign(completedSteps, progress.completedSteps || {});
        
        console.log('Loaded cooking progress:', progress);
      } catch (error) {
        console.error('Failed to load cooking progress:', error);
        // Initialize with defaults if loading fails
        currentStep.value = 0;
        servingMultiplier.value = 1;
      }
    };
    
    const saveProgress = async () => {
      try {
        const { recipeId, source } = getProgressKey();
        const progressData = {
          currentStep: currentStep.value,
          completedSteps: { ...completedSteps },
          checkedIngredients: { ...checkedIngredients },
          servingMultiplier: servingMultiplier.value,
          source
        };
        
        await axios.post(`${store.server_domain}/recipes/${recipeId}/cooking-progress`, progressData);
        console.log('Progress saved:', progressData);
      } catch (error) {
        console.error('Failed to save cooking progress:', error);
      }
    };
    
    const clearProgress = async () => {
      try {
        const { recipeId, source } = getProgressKey();
        await axios.delete(`${store.server_domain}/recipes/${recipeId}/cooking-progress?source=${source}`);
        console.log('Progress cleared');
      } catch (error) {
        console.error('Failed to clear cooking progress:', error);
      }
    };
    
    const fetchRecipe = async () => {
      try {
        const { recipeId } = route.params;
        const source = route.query.source || 'spoon';
        
        // First load any existing progress
        await loadProgress();
        
        // Then fetch recipe with current serving multiplier
        const response = await axios.get(`${store.server_domain}/recipes/${recipeId}/cooking-mode?source=${source}&servings=${servingMultiplier.value}`);
        recipe.value = response.data;
        
        // Start auto-save
        startAutoSave();
      } catch (error) {
        console.error('Failed to fetch recipe for cooking mode:', error);
        window.toast("Error", "Failed to load cooking mode", "danger");
      } finally {
        loading.value = false;
      }
    };
    
    const startAutoSave = () => {
      if (autoSaveInterval) {
        clearInterval(autoSaveInterval);
      }
      
      autoSaveInterval = setInterval(() => {
        saveProgress();
      }, AUTO_SAVE_INTERVAL);
    };
    
    const stopAutoSave = () => {
      if (autoSaveInterval) {
        clearInterval(autoSaveInterval);
        autoSaveInterval = null;
      }
    };
    
    const nextStep = () => {
      if (currentStep.value < recipe.value.totalSteps - 1) {
        currentStep.value++;
        saveProgress(); // Save immediately on step change
      }
    };
    
    const previousStep = () => {
      if (currentStep.value > 0) {
        currentStep.value--;
        saveProgress(); // Save immediately on step change
      }
    };
    
    const goToStep = (stepIndex) => {
      currentStep.value = stepIndex;
      saveProgress(); // Save immediately on step change
    };
    
    const adjustServings = async (change) => {
      const newMultiplier = Math.max(0.5, Math.min(5, servingMultiplier.value + change));
      if (newMultiplier !== servingMultiplier.value) {
        servingMultiplier.value = newMultiplier;
        
        // Refetch recipe with new servings
        try {
          const { recipeId } = route.params;
          const source = route.query.source || 'spoon';
          
          const response = await axios.get(`${store.server_domain}/recipes/${recipeId}/cooking-mode?source=${source}&servings=${newMultiplier}`);
          recipe.value = response.data;
          
          // Save the new serving multiplier
          saveProgress();
        } catch (error) {
          console.error('Failed to adjust servings:', error);
          window.toast("Error", "Failed to adjust servings", "danger");
        }
      }
    };
    
    const exitCookingMode = async () => {
      // Save progress before exiting
      await saveProgress();
      stopAutoSave();
      
      const { recipeId } = route.params;
      const source = route.query.source || 'spoon';
      router.push(`/recipe/${recipeId}?source=${source}`);
    };
    
    const finishCooking = async () => {
      // Clear progress when cooking is finished
      await clearProgress();
      stopAutoSave();
      
      window.toast("Success", "Cooking completed! Progress cleared.", "success");
      
      const { recipeId } = route.params;
      const source = route.query.source || 'spoon';
      router.push(`/recipe/${recipeId}?source=${source}`);
    };
    
    // Watch for changes to save progress
    watch([checkedIngredients, completedSteps], () => {
      // Debounce saves for ingredient/step changes
      if (autoSaveInterval) {
        saveProgress();
      }
    }, { deep: true });
    
    // Save progress when user leaves the page
    const handleBeforeUnload = () => {
      saveProgress();
    };
    
    onMounted(() => {
      fetchRecipe();
      window.addEventListener('beforeunload', handleBeforeUnload);
    });
    
    onUnmounted(() => {
      stopAutoSave();
      saveProgress(); // Final save when component unmounts
      window.removeEventListener('beforeunload', handleBeforeUnload);
    });
    
    return {
      recipe,
      loading,
      currentStep,
      servingMultiplier,
      checkedIngredients,
      completedSteps,
      store,
      nextStep,
      previousStep,
      goToStep,
      adjustServings,
      exitCookingMode,
      finishCooking
    };
  }
};
</script>

<style scoped>
.cooking-mode-container {
  max-width: 1400px;
  padding: 0 15px;
}

.cooking-header {
  z-index: 1020;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.serving-controls {
  background: #f8f9fa;
  border-radius: 25px;
  padding: 5px 15px;
}

.ingredients-panel {
  position: sticky;
  top: 120px;
  max-height: calc(100vh - 140px);
}

.ingredients-list {
  max-height: 400px;
  overflow-y: auto;
}

.ingredient-item {
  padding: 8px;
  border-radius: 8px;
  transition: background-color 0.2s;
}

.ingredient-item:hover {
  background-color: #f8f9fa;
}

.ingredient-text {
  cursor: pointer;
  font-size: 0.9rem;
  line-height: 1.4;
}

.steps-overview {
  max-height: 300px;
  overflow-y: auto;
}

.step-preview {
  display: flex;
  align-items: flex-start;
  padding: 12px;
  margin-bottom: 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  border: 2px solid transparent;
}

.step-preview.active {
  background-color: #e3f2fd;
  border-color: #2196f3;
}

.step-preview.completed {
  background-color: #e8f5e8;
  border-color: #4caf50;
}

.step-preview.upcoming {
  background-color: #f8f9fa;
}

.step-preview:hover {
  transform: translateX(4px);
}

.step-number {
  flex-shrink: 0;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin-right: 12px;
  font-size: 0.8rem;
}

.step-preview.active .step-number {
  background-color: #2196f3;
  color: white;
}

.step-preview.completed .step-number {
  background-color: #4caf50;
  color: white;
}

.step-preview.upcoming .step-number {
  background-color: #dee2e6;
  color: #6c757d;
}

.step-text {
  flex: 1;
  font-size: 0.85rem;
  line-height: 1.4;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
}

.current-step-detail {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 12px;
  padding: 24px;
  margin-top: 20px;
}

.step-badge {
  background: #007bff;
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.step-instruction {
  font-size: 1.1rem;
  line-height: 1.6;
  margin: 16px 0;
  color: #2c3e50;
}

.completion-message {
  animation: fadeInScale 0.5s ease-out;
}

@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@media (max-width: 768px) {
  .cooking-header .row > div {
    text-align: center !important;
    margin-bottom: 10px;
  }
  
  .step-navigation {
    margin-top: 10px;
  }
  
  .ingredients-panel {
    position: static;
    max-height: none;
  }
}
</style>
