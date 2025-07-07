<template>
  <div class="container">
    <h1 class="title">My Recipes</h1>
    <div class="mb-3">
      <button class="btn btn-primary" @click="openCreateRecipeModal()">
        Create New Recipe
      </button>
    </div>
    <RecipePreviewList title="My Recipes" :recipes="myRecipes" />
  </div>
</template>

<script>
import RecipePreviewList from "../components/RecipePreviewList.vue";
import axios from "axios";
import store from "../store";

export default {
  name: "MyRecipesPage",
  components: {
    RecipePreviewList,
  },
  props: {
    openCreateRecipeModal: {
      type: Function,
      required: false
    }
  },
  data() {
    return {
      myRecipes: []
    };
  },
  async created() {
    if (!store.username) {
      this.$router.push('/login');
      return;
    }
    try {
      const response = await axios.get(`${store.server_domain}/users/myRecipes`);
      this.myRecipes = response.data.map(r => ({
        ...r,
        isSpoonacular: false
      }));
    } catch (error) {
      console.error("Failed to load my recipes:", error);
      window.toast("Error", "Failed to load your recipes.", "danger");
    }
  }
};
</script>
