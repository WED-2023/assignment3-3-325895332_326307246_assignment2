<template>
    <div class="container">
      <div v-if="recipe">
        <div class="recipe-header mt-3 mb-4">
          <h1>{{ recipe.title }}</h1>
          <img :src="recipe.image" class="center" />
        </div>
        <div class="recipe-body">
          <div class="wrapper">
            <div class="wrapped">
              <div class="mb-3">
                <div>Ready in {{ recipe.readyInMinutes }} minutes</div>
                <div>Servings: {{ recipe.servings }}</div>
                <div v-if="recipe.isFavorite !== undefined">
                  Favorite: {{ recipe.isFavorite ? 'Yes' : 'No' }}
                  <button v-if="!recipe.isFavorite && this.$root.store.username" @click="markAsFavorite" class="btn btn-sm btn-outline-danger ms-2">
                    Add to Favorites
                  </button>
                </div>
                <div v-if="recipe.isWatched !== undefined">
                  Watched: {{ recipe.isWatched ? 'Yes' : 'No' }}
                </div>
              </div>
              Ingredients:
              <ul>
                <li
                  v-for="(ing, index) in recipe.ingredients"
                  :key="index"
                >
                  {{ ing }}
                </li>
              </ul>
            </div>
            <div class="wrapped">
              Instructions:
              <ol>
                <li v-for="(step, index) in recipe.instructions" :key="index">
                  {{ step }}
                </li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        recipe: null
      };
    },
    methods: {
      async markAsFavorite() {
        try {
          await this.axios.post(`${this.$root.store.server_domain}/users/favorites`, {
            recipeId: this.recipe.id,
            isSpoonacular: this.recipe.source === 'spoon'
          });
          this.recipe.isFavorite = true;
          this.$root.toast("Success", "Recipe added to favorites.", "success");
        } catch (error) {
          console.error("Failed to add to favorites", error);
          this.$root.toast("Error", "Could not add to favorites.", "danger");
        }
      }
    },
    async created() {
      try {
        const { recipeId } = this.$route.params;
        const { source } = this.$route.query;

        if (!recipeId || !source) {
          this.$router.replace("/NotFound");
          return;
        }

        const response = await this.axios.get(
          `${this.$root.store.server_domain}/recipes/${recipeId}`,
          { params: { source } }
        );
  
        if (response.status !== 200) {
          this.$router.replace("/NotFound");
          return;
        }
  
        this.recipe = response.data;
      } catch (error) {
        console.log(error);
        this.$router.replace("/NotFound");
      }
    }
  };
  </script>
  
  <style scoped>
  .wrapper {
    display: flex;
  }
  .wrapped {
    width: 50%;
  }
  .center {
    display: block;
    margin-left: auto;
    margin-right: auto;
    width: 50%;
  }
  /* .recipe-header{
  
  } */
  </style>
