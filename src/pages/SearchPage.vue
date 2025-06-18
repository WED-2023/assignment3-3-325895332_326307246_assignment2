<template>
    <div class="container">
      <h1 class="title">Search Page</h1>
      <form @submit.prevent="search" class="mb-4">
        <div class="row g-3 align-items-center">
          <div class="col-auto">
            <label for="query" class="col-form-label">Search for:</label>
          </div>
          <div class="col">
            <input type="text" id="query" class="form-control" v-model="searchQuery">
          </div>
          <div class="col-auto">
            <label for="number" class="col-form-label">Results:</label>
          </div>
          <div class="col-auto">
            <select id="number" class="form-select" v-model="number">
              <option>5</option>
              <option>10</option>
              <option>15</option>
            </select>
          </div>
          <div class="col-auto">
            <button type="submit" class="btn btn-primary">Search</button>
          </div>
        </div>
      </form>
      <RecipePreviewList title="Search Results" :recipes="recipes" />
    </div>
  </template>
  
<script>
import RecipePreviewList from "../components/RecipePreviewList.vue";
import axios from "axios";
import store from "../store";

export default {
  name: "SearchPage",
  components: {
    RecipePreviewList,
  },
  data() {
    return {
      searchQuery: '',
      number: 5,
      recipes: [],
    };
  },
  methods: {
    async search() {
      if (!this.searchQuery.trim()) {
        window.toast("Info", "Please enter a search query.", "info");
        return;
      }
      try {
        const response = await axios.get(`${store.server_domain}/recipes/search`, {
          params: {
            query: this.searchQuery,
            number: this.number,
          },
        });
        this.recipes = response.data.map(r => ({ ...r, isSpoonacular: true }));
      } catch (error) {
        console.error(error);
        window.toast("Error", "Search failed.", "danger");
      }
    },
  },
};
</script>
