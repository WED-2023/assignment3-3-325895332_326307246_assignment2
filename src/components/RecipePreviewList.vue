<template>
  <div class="recipe-list-container">
    <div class="section-header">
      <h3 class="section-title">
        <i class="fas fa-utensils section-icon"></i>
        {{ title }}
        <slot></slot>
      </h3>
    </div>
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
.recipe-list-container {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 16px;
  padding: 2rem;
  min-height: 400px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.8);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
  }
}

.section-header {
  margin-bottom: 2rem;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    bottom: -10px;
    left: 0;
    width: 60px;
    height: 3px;
    background: linear-gradient(90deg, #007bff, #0056b3);
    border-radius: 2px;
  }
}

.section-title {
  color: #2c3e50;
  font-weight: 700;
  font-size: 1.5rem;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.section-icon {
  color: #007bff;
  font-size: 1.3rem;
  background: rgba(0, 123, 255, 0.1);
  padding: 8px;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.recipes-vertical {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.recipe-item {
  width: 100%;
  opacity: 0;
  transform: translateY(20px);
  animation: fadeInUp 0.6s ease forwards;
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.02);
  }

  // Stagger animation for each item
  @for $i from 1 through 10 {
    &:nth-child(#{$i}) {
      animation-delay: #{($i - 1) * 0.1s};
    }
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.recipePreview {
  width: 100%;
  display: block;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(0, 0, 0, 0.06);

  &:hover {
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    transform: translateY(-4px);
    border-color: rgba(0, 123, 255, 0.2);
  }
}

// Responsive adjustments
@media (max-width: 768px) {
  .recipe-list-container {
    padding: 1.5rem;
    border-radius: 12px;
  }

  .section-title {
    font-size: 1.3rem;
    gap: 0.5rem;
  }

  .section-icon {
    width: 35px;
    height: 35px;
    font-size: 1.1rem;
  }

  .recipes-vertical {
    gap: 1rem;
  }
  
  .recipe-item {
    &:hover {
      transform: scale(1.01);
    }
  }
}

@media (max-width: 576px) {
  .recipe-list-container {
    padding: 1rem;
    margin: 0.5rem;
  }

  .section-title {
    font-size: 1.2rem;
    letter-spacing: 0.3px;
  }

  .recipes-vertical {
    gap: 0.75rem;
  }
}

// Dark mode support
@media (prefers-color-scheme: dark) {
  .recipe-list-container {
    background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
    border-color: rgba(255, 255, 255, 0.1);
  }

  .section-title {
    color: #ecf0f1;
  }

  .recipePreview {
    background: #34495e;
    border-color: rgba(255, 255, 255, 0.1);
  }
}
</style>
