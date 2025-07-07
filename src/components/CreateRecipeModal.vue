<template>
  <div class="modal fade show d-block" tabindex="-1" style="background:rgba(0,0,0,0.5);" @click.self="$emit('close')">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">{{ recipe.isFamilyRecipe ? 'Create Family Recipe' : 'Create New Recipe' }}</h5>
          <button type="button" class="btn-close" @click="$emit('close')"></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="createRecipe">
            <div class="row mb-3">
              <div class="col-md-8">
                <label class="form-label">Recipe Title *</label>
                <input v-model="recipe.title" type="text" class="form-control" required>
              </div>
              <div class="col-md-4">
                <label class="form-label">Image URL</label>
                <input v-model="recipe.image" type="url" class="form-control">
              </div>
            </div>
            <div class="row mb-3">
              <div class="col-md-6">
                <label class="form-label">Preparation Time (minutes) *</label>
                <input v-model.number="recipe.readyInMinutes" type="number" class="form-control" min="1" required>
              </div>
              <div class="col-md-6">
                <label class="form-label">Servings *</label>
                <input v-model.number="recipe.servings" type="number" class="form-control" min="1" required>
              </div>
            </div>
            <div class="mb-3">
              <label class="form-label">Dietary Information</label>
              <div class="form-check-group d-flex gap-3">
                <div class="form-check">
                  <input v-model="recipe.vegan" type="checkbox" class="form-check-input" id="vegan">
                  <label class="form-check-label" for="vegan">Vegan</label>
                </div>
                <div class="form-check">
                  <input v-model="recipe.vegetarian" type="checkbox" class="form-check-input" id="vegetarian">
                  <label class="form-check-label" for="vegetarian">Vegetarian</label>
                </div>
                <div class="form-check">
                  <input v-model="recipe.glutenFree" type="checkbox" class="form-check-input" id="glutenFree">
                  <label class="form-check-label" for="glutenFree">Gluten Free</label>
                </div>
              </div>
            </div>
            <div class="mb-3">
              <div class="form-check">
                <input v-model="recipe.isFamilyRecipe" type="checkbox" class="form-check-input" id="isFamilyRecipe">
                <label class="form-check-label" for="isFamilyRecipe">This is a family recipe</label>
              </div>
            </div>
            <div v-if="recipe.isFamilyRecipe" class="family-story-section mb-3">
              <div class="card bg-light">
                <div class="card-body">
                  <h6 class="card-title"><i class="fas fa-home me-2"></i>Family Story</h6>
                  <div class="row">
                    <div class="col-md-6 mb-2">
                      <label class="form-label">Who made this recipe?</label>
                      <input v-model="recipe.familyStory.who" type="text" class="form-control" placeholder="e.g., Grandma Sarah">
                    </div>
                    <div class="col-md-6 mb-2">
                      <label class="form-label">When was it made?</label>
                      <input v-model="recipe.familyStory.when" type="text" class="form-control" placeholder="e.g., Every Sunday dinner">
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="mb-3">
              <label class="form-label">Ingredients *</label>
              <div v-for="(ingredient, index) in recipe.ingredients" :key="index" class="input-group mb-2">
                <input v-model="ingredient.quantity" type="text" class="form-control" placeholder="Quantity" style="max-width: 120px;">
                <input v-model="ingredient.name" type="text" class="form-control" placeholder="Ingredient name">
                <button @click="removeIngredient(index)" type="button" class="btn btn-outline-danger">
                  <i class="fas fa-times"></i>
                </button>
              </div>
              <button @click="addIngredient" type="button" class="btn btn-outline-primary">
                <i class="fas fa-plus me-2"></i>Add Ingredient
              </button>
            </div>
            <div class="mb-3">
              <label class="form-label">Instructions *</label>
              <div v-for="(instruction, index) in recipe.instructions" :key="index" class="input-group mb-2">
                <span class="input-group-text">{{ index + 1 }}</span>
                <textarea v-model="recipe.instructions[index]" class="form-control" rows="2" placeholder="Instruction step"></textarea>
                <button @click="removeInstruction(index)" type="button" class="btn btn-outline-danger">
                  <i class="fas fa-times"></i>
                </button>
              </div>
              <button @click="addInstruction" type="button" class="btn btn-outline-primary">
                <i class="fas fa-plus me-2"></i>Add Step
              </button>
            </div>
            <div class="d-grid gap-2 d-md-flex justify-content-md-end">
              <button type="button" class="btn btn-secondary me-md-2" @click="$emit('close')">Cancel</button>
              <button type="submit" class="btn btn-success" :disabled="loading">
                <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                <i v-else class="fas fa-save me-2"></i>
                {{ loading ? 'Creating...' : 'Create Recipe' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { reactive, ref, watch } from 'vue';
import axios from 'axios';
import store from '../store';
export default {
  name: 'CreateRecipeModal',
  props: {
    forceFamilyRecipe: {
      type: Boolean,
      default: false
    }
  },
  emits: ['close'],
  setup(props, { emit }) {
    const loading = ref(false);
    const recipe = reactive({
      title: '',
      image: '',
      readyInMinutes: 30,
      servings: 4,
      vegan: false,
      vegetarian: false,
      glutenFree: false,
      isFamilyRecipe: props.forceFamilyRecipe,
      familyStory: {
        who: '',
        when: ''
      },
      ingredients: [{ quantity: '', name: '' }],
      instructions: ['']
    });

    // Watch for prop changes to forceFamilyRecipe
    watch(() => props.forceFamilyRecipe, (val) => {
      recipe.isFamilyRecipe = val;
    }, { immediate: true });

    const addIngredient = () => {
      recipe.ingredients.push({ quantity: '', name: '' });
    };
    const removeIngredient = (index) => {
      if (recipe.ingredients.length > 1) {
        recipe.ingredients.splice(index, 1);
      }
    };
    const addInstruction = () => {
      recipe.instructions.push('');
    };
    const removeInstruction = (index) => {
      if (recipe.instructions.length > 1) {
        recipe.instructions.splice(index, 1);
      }
    };

    const createRecipe = async () => {
      if (!recipe.title.trim()) {
        window.toast("Error", "Recipe title is required", "danger");
        return;
      }
      const validIngredients = recipe.ingredients.filter(ing => ing.name.trim() && ing.quantity.trim());
      if (validIngredients.length === 0) {
        window.toast("Error", "At least one ingredient is required", "danger");
        return;
      }
      const validInstructions = recipe.instructions.filter(inst => inst.trim());
      if (validInstructions.length === 0) {
        window.toast("Error", "At least one instruction is required", "danger");
        return;
      }
      loading.value = true;
      try {
        const payload = {
          title: recipe.title,
          image: recipe.image || null,
          readyInMinutes: recipe.readyInMinutes,
          servings: recipe.servings,
          vegan: recipe.vegan,
          vegetarian: recipe.vegetarian,
          glutenFree: recipe.glutenFree,
          isFamilyRecipe: recipe.isFamilyRecipe,
          familyStory: recipe.isFamilyRecipe ? recipe.familyStory : null,
          ingredients: validIngredients,
          instructions: validInstructions
        };
        await axios.post(`${store.server_domain}/recipes`, payload);
        window.toast("Success", "Recipe created successfully!", "success");
        emit('close');
        // Optionally, emit an event to refresh the recipe list
      } catch (error) {
        console.error("Failed to create recipe:", error);
        window.toast("Error", error.response?.data?.message || "Failed to create recipe", "danger");
      } finally {
        loading.value = false;
      }
    };

    return {
      recipe,
      loading,
      addIngredient,
      removeIngredient,
      addInstruction,
      removeInstruction,
      createRecipe
    };
  }
};
</script>

<style scoped>
.modal {
  display: block;
}
.family-story-section {
  border-left: 4px solid #ffc107;
}
.input-group textarea {
  resize: vertical;
  min-height: 38px;
}
.form-check-group {
  flex-wrap: wrap;
}
@media (max-width: 768px) {
  .form-check-group {
    flex-direction: column;
    gap: 0.5rem !important;
  }
}
</style>
