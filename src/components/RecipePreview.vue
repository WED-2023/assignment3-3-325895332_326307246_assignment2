<template>
  <router-link
    :to="{ name: 'recipe', params: { recipeId: recipe.id }, query: { source: recipe.isSpoonacular ? 'spoon' : 'db' } }"
    class="recipe-preview-link"
  >
    <div class="card h-100">
      <img
        v-if="recipe.image"
        :src="recipe.image"
        class="card-img-top recipe-image"
        alt="Recipe image"
      />
      <div class="card-body text-center">
        <h5 class="card-title">{{ recipe.title }}</h5>
        <p class="card-text">{{ recipe.readyInMinutes }} minutes</p>
        <p class="card-text">{{ recipe.aggregateLikes }} likes</p>
      </div>
    </div>
  </router-link>
</template>

<script>
export default {
  name: "RecipePreview",
  props: {
    recipe: {
      type: Object,
      required: true
    }
  }
}
</script>

<style scoped>
.recipe-preview-link {
  text-decoration: none;
  color: inherit;
}
.recipe-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
}
</style>
