import { reactive } from 'vue';
import axios from 'axios';

const store = reactive({
  username: localStorage.getItem('username'),
  server_domain: "http://localhost:3000",
  mealPlan: (() => {
    const savedMealPlan = JSON.parse(sessionStorage.getItem('mealPlan') || '[]');
    // Migrate existing data to ensure currentServings field exists
    return savedMealPlan.map(item => ({
      ...item,
      currentServings: item.currentServings || item.recipe?.servings || 1
    }));
  })(),

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
    // Clear meal plan on logout
    this.clearMealPlan();
  },

  // Meal plan functionality
  addToMealPlan(recipe) {
    const existingIndex = this.mealPlan.findIndex(item => 
      item.recipe.id === recipe.id && item.recipe.isSpoonacular === recipe.isSpoonacular
    );

    if (existingIndex === -1) {
      const mealPlanItem = {
        id: Date.now() + Math.random(),
        recipe,
        addedAt: new Date().toISOString(),
        currentServings: recipe.servings || 1, // Track current serving size
        progress: {
          currentStep: 0,
          totalSteps: recipe.analyzedInstructions?.[0]?.steps?.length || recipe.instructions?.length || 0,
          isCompleted: false,
          startedCooking: false
        },
        order: this.mealPlan.length + 1
      };
      
      this.mealPlan.push(mealPlanItem);
      this.saveMealPlan();
      return true;
    }
    return false;
  },

  removeFromMealPlan(itemId) {
    const index = this.mealPlan.findIndex(item => item.id === itemId);
    if (index !== -1) {
      this.mealPlan.splice(index, 1);
      this.reorderMealPlan();
      this.saveMealPlan();
      return true;
    }
    return false;
  },

  updateMealPlanItemOrder(itemId, newOrder) {
    const item = this.mealPlan.find(item => item.id === itemId);
    if (item) {
      item.order = newOrder;
      this.mealPlan.sort((a, b) => a.order - b.order);
      this.saveMealPlan();
    }
  },

  reorderMealPlan() {
    this.mealPlan.forEach((item, index) => {
      item.order = index + 1;
    });
  },

  updateCookingProgress(itemId, currentStep, startedCooking = false) {
    const item = this.mealPlan.find(item => item.id === itemId);
    if (item) {
      item.progress.currentStep = currentStep;
      item.progress.startedCooking = startedCooking;
      item.progress.isCompleted = currentStep >= item.progress.totalSteps;
      this.saveMealPlan();
    }
  },

  updateServingSize(itemId, servings) {
    const item = this.mealPlan.find(item => item.id === itemId);
    if (item) {
      item.currentServings = servings;
      this.saveMealPlan();
    }
  },

  clearMealPlan() {
    this.mealPlan = [];
    sessionStorage.removeItem('mealPlan');
  },

  saveMealPlan() {
    sessionStorage.setItem('mealPlan', JSON.stringify(this.mealPlan));
  },

  getMealPlanCount() {
    return this.mealPlan.length;
  }
});

export default store;
