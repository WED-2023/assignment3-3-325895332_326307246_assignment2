<template>
  <div class="container">
    <h3>
      {{ title }}:
      <slot></slot>
    </h3>
    <div class="recipes-vertical">
      <div class="recipe-item" v-for="r in recipes" :key="r.id">
        <RecipePreview 
          class="recipePreview" 
          :recipe="r" 
          @favorite-changed="handleFavoriteChanged"
        />
      </div>
    </div>
  </div>
</template>

<script>
import RecipePreview from "./RecipePreview.vue";
export default {
  name: "RecipePreviewList",
  components: {
    RecipePreview
  },
  props: {
    title: {
      type: String,
      required: true
    },
    recipes: {
      type: Array,
      required: true
    }
  },
  emits: ['favorite-changed'],
  methods: {
    handleFavoriteChanged(event) {
      // Forward the event to parent component
      this.$emit('favorite-changed', event);
    }
  }
};
</script>

<style lang="scss" scoped>
.container {
  min-height: 400px;
}

.recipes-vertical {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.recipe-item {
  width: 100%;
  margin-bottom: 0.5rem;
}

.recipePreview {
  width: 100%;
  display: block;
}

// Responsive adjustments
@media (max-width: 768px) {
  .recipes-vertical {
    gap: 0.75rem;
  }
  
  .recipe-item {
    margin-bottom: 0.25rem;
  }
}
</style>
