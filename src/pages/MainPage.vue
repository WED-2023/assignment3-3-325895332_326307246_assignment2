<template>
  <div class="container-fluid">
    <h1 class="title">Main Page</h1>

    <div class="row">
      <!-- Left Column - Random Recipes -->
      <div class="col-lg-6 col-md-12 mb-4">
        <RecipePreviewList 
          title="Random Recipes" 
          :recipes="randomRecipes" 
          class="RandomRecipes" 
          @favorite-changed="handleFavoriteChanged"
        />
        <div class="text-center mb-4">
          <button @click="fetchRecipes" class="btn btn-secondary">New Random Recipes</button>
        </div>
      </div>

      <!-- Right Column - Login Form (if not logged in) OR Last Viewed Recipes (if logged in) -->
      <div class="col-lg-6 col-md-12 mb-4">
        <!-- Login Form Section (if not logged in) -->
        <div v-if="!store.username" class="login-section">
          <div class="login-form-container">
            <h3 class="login-title">Sign In</h3>
            <form @submit.prevent="loginFromMainPage" class="login-form">
              <div class="form-group mb-3">
                <label for="username" class="form-label">Username</label>
                <input 
                  v-model="loginData.username" 
                  type="text" 
                  id="username"
                  class="form-control" 
                  placeholder="Enter username"
                  required
                />
              </div>
              
              <div class="form-group mb-3">
                <label for="password" class="form-label">Password</label>
                <input 
                  v-model="loginData.password" 
                  type="password" 
                  id="password"
                  class="form-control" 
                  placeholder="Enter password"
                  required
                />
              </div>
              
              <div class="form-check mb-3">
                <input 
                  v-model="loginData.rememberMe" 
                  type="checkbox" 
                  id="rememberMe"
                  class="form-check-input"
                />
                <label for="rememberMe" class="form-check-label">Remember me</label>
              </div>
              
              <button type="submit" class="btn btn-primary w-100 mb-3" :disabled="loginLoading">
                <span v-if="loginLoading" class="spinner-border spinner-border-sm me-2"></span>
                Submit
              </button>
              
              <div class="text-center">
                <a href="#" class="forgot-password">Forgot password?</a>
              </div>
            </form>
          </div>
        </div>

        <!-- Last Viewed Recipes Section (if logged in) -->
        <div v-else>
          <RecipePreviewList
            title="Last Viewed Recipes"
            :recipes="lastViewedRecipes"
            class="RandomRecipes"
            @favorite-changed="handleFavoriteChanged"
          />
        </div>
      </div>
    </div>
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

    const loginData = reactive({
      username: '',
      password: '',
      rememberMe: false
    });

    const loginLoading = reactive({ value: false });

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

    const loginFromMainPage = async () => {
      loginLoading.value = true;
      try {
        const response = await axios.post(`${store.server_domain}/Login`, {
          username: loginData.username,
          password: loginData.password
        });

        if (response.status === 200) {
          store.login(loginData.username);
          window.toast("Success", "Login successful!", "success");
          
          // Reset form
          loginData.username = '';
          loginData.password = '';
          loginData.rememberMe = false;
          
          // Refresh recipes to get last viewed
          await fetchRecipes();
        }
      } catch (error) {
        const errorMessage = error.response?.data?.message || "Login failed. Please check your credentials.";
        window.toast("Error", errorMessage, "danger");
      } finally {
        loginLoading.value = false;
      }
    };

    const handleFavoriteChanged = (event) => {
      const { recipeId, isFavorite } = event;
      
      // Update random recipes
      const randomRecipe = state.randomRecipes.find(r => r.id === recipeId);
      if (randomRecipe) {
        randomRecipe.isFavorite = isFavorite;
      }
      
      // Update last viewed recipes
      const lastViewedRecipe = state.lastViewedRecipes.find(r => r.id === recipeId);
      if (lastViewedRecipe) {
        lastViewedRecipe.isFavorite = isFavorite;
      }
    };

    onMounted(fetchRecipes);

    return { 
      store, 
      randomRecipes: computed(() => state.randomRecipes),
      lastViewedRecipes: computed(() => state.lastViewedRecipes),
      fetchRecipes,
      handleFavoriteChanged,
      loginData,
      loginLoading: computed(() => loginLoading.value),
      loginFromMainPage
    };
  }
};
</script>

<style lang="scss" scoped>
.title {
  color: #2c3e50;
  font-weight: 600;
  text-align: center;
  margin-bottom: 2rem;
}

.RandomRecipes {
  margin: 10px 0 10px;
}

.login-section {
  height: 100%;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 1rem;
}

.login-form-container {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 2rem;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.login-title {
  text-align: center;
  margin-bottom: 1.5rem;
  color: #2c3e50;
  font-weight: 600;
  font-size: 1.5rem;
}

.login-form {
  .form-label {
    font-weight: 600;
    color: #495057;
    margin-bottom: 0.5rem;
  }
  
  .form-control {
    border-radius: 6px;
    border: 1px solid #ced4da;
    padding: 0.75rem;
    font-size: 1rem;
    transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
    
    &:focus {
      border-color: #007bff;
      box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
    }
  }
  
  .form-check {
    .form-check-input {
      margin-top: 0.3rem;
    }
    
    .form-check-label {
      color: #495057;
      font-size: 0.9rem;
    }
  }
  
  .btn-primary {
    background: #007bff;
    border: none;
    border-radius: 6px;
    padding: 0.75rem;
    font-weight: 600;
    transition: all 0.2s ease;
    
    &:hover:not(:disabled) {
      background: #0056b3;
      transform: translateY(-1px);
    }
    
    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }
  
  .forgot-password {
    color: #007bff;
    text-decoration: none;
    font-size: 0.9rem;
    
    &:hover {
      text-decoration: underline;
    }
  }
}

.blur {
  -webkit-filter: blur(5px); /* Safari 6.0 - 9.0 */
  filter: blur(2px);
}

:deep(.blur .recipe-preview) {
  pointer-events: none;
  cursor: default;
}

// Responsive design
@media (max-width: 576px) {
  .login-form-container {
    padding: 1.5rem;
    margin: 0 1rem;
  }
  
  .title {
    font-size: 1.5rem;
  }
}
</style>
