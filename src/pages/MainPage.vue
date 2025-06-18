<template>
  <div class="container">
    <h1 class="title">Main Page</h1>

    <RecipePreviewList title="Random Recipes" :recipes="randomRecipes" class="RandomRecipes center" />
    <div class="text-center mb-4">
      <button @click="fetchRecipes" class="btn btn-secondary">New Random Recipes</button>
    </div>

    <div v-if="!store.username" class="text-center mt-4">
      <router-link :to="{ name: 'login' }">
        <button class="btn btn-primary">You need to Login to view this</button>
      </router-link>
    </div>

    <RecipePreviewList
      title="Last Viewed Recipes"
      :recipes="lastViewedRecipes"
      :class="{
        RandomRecipes: true,
        blur: !store.username,
        center: true
      }"
    />
  </div>
</template>

<script>
import { reactive, onMounted, computed } from 'vue';
import { getCurrentInstance } from 'vue';
import RecipePreviewList from "../components/RecipePreviewList.vue";
import axios from 'axios';

export default {
  components: {
    RecipePreviewList
  },
  setup() {
    const internalInstance = getCurrentInstance();
    const store = internalInstance.appContext.config.globalProperties.store;

    const state = reactive({
      randomRecipes: [],
      lastViewedRecipes: [],
    });

    const fetchRecipes = async () => {
      try {
        const response = await axios.get(`${store.server_domain}/recipes`);
        const { random, lastWatched } = response.data;
        
        state.randomRecipes = random.map(r => ({ ...r, isSpoonacular: true }));

        if (store.username && Array.isArray(lastWatched)) {
          state.lastViewedRecipes = lastWatched;
        }

      } catch (error) {
        console.error(error);
      }
    };

    onMounted(fetchRecipes);

    return { 
      store, 
      randomRecipes: computed(() => state.randomRecipes),
      lastViewedRecipes: computed(() => state.lastViewedRecipes),
      fetchRecipes
    };
  }
};
</script>

<style lang="scss" scoped>
.RandomRecipes {
  margin: 10px 0 10px;
}
.blur {
  -webkit-filter: blur(5px); /* Safari 6.0 - 9.0 */
  filter: blur(2px);
}
::v-deep .blur .recipe-preview {
  pointer-events: none;
  cursor: default;
}
</style>
