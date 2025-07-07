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
                <router-link :to="{ name: 'register' }" class="register-link">
                  <i class="fas fa-user-plus me-1"></i>Create an Account
                </router-link>
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
  font-weight: 700;
  text-align: center;
  margin-bottom: 3rem;
  font-size: 2.5rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    bottom: -15px;
    left: 50%;
    transform: translateX(-50%);
    width: 100px;
    height: 4px;
    background: linear-gradient(90deg, #007bff, #0056b3);
    border-radius: 2px;
  }
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
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border: 1px solid rgba(0, 123, 255, 0.1);
  border-radius: 16px;
  padding: 2.5rem;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 4px;
    background: linear-gradient(90deg, #007bff, #0056b3);
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
  }
}

.login-title {
  text-align: center;
  margin-bottom: 2rem;
  color: #2c3e50;
  font-weight: 700;
  font-size: 1.75rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    bottom: -10px;
    left: 50%;
    transform: translateX(-50%);
    width: 50px;
    height: 2px;
    background: linear-gradient(90deg, #007bff, #0056b3);
    border-radius: 1px;
  }
}

.login-form {
  .form-label {
    font-weight: 600;
    color: #2c3e50;
    margin-bottom: 0.75rem;
    text-transform: uppercase;
    font-size: 0.85rem;
    letter-spacing: 0.5px;
  }
  
  .form-control {
    border-radius: 8px;
    border: 2px solid #e9ecef;
    padding: 1rem;
    font-size: 1rem;
    background: rgba(255, 255, 255, 0.8);
    transition: all 0.3s ease;
    
    &:focus {
      border-color: #007bff;
      box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.15);
      background: white;
      transform: translateY(-1px);
    }

    &::placeholder {
      color: #adb5bd;
      font-style: italic;
    }
  }
  
  .form-check {
    margin: 1.5rem 0;
    
    .form-check-input {
      margin-top: 0.3rem;
      transform: scale(1.1);
      
      &:checked {
        background-color: #007bff;
        border-color: #007bff;
      }
    }
    
    .form-check-label {
      color: #495057;
      font-size: 0.95rem;
      font-weight: 500;
      margin-left: 0.5rem;
    }
  }
  
  .btn-primary {
    background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
    border: none;
    border-radius: 8px;
    padding: 1rem;
    font-weight: 700;
    font-size: 1rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
      transition: left 0.5s;
    }
    
    &:hover:not(:disabled) {
      background: linear-gradient(135deg, #0056b3 0%, #004085 100%);
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(0, 123, 255, 0.3);
      
      &::before {
        left: 100%;
      }
    }
    
    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }
  }
  
  .forgot-password {
    color: #007bff;
    text-decoration: none;
    font-size: 0.9rem;
    font-weight: 500;
    transition: all 0.2s ease;
    
    &:hover {
      text-decoration: underline;
      color: #0056b3;
      transform: translateY(-1px);
    }
  }
}

.btn-secondary {
  background: linear-gradient(135deg, #6c757d 0%, #495057 100%);
  border: none;
  border-radius: 25px;
  padding: 0.75rem 2rem;
  font-weight: 600;
  color: white;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  &:hover {
    background: linear-gradient(135deg, #5a6268 0%, #3d4142 100%);
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(108, 117, 125, 0.3);
  }
}

.blur {
  -webkit-filter: blur(5px);
  filter: blur(2px);
}

:deep(.blur .recipe-preview) {
  pointer-events: none;
  cursor: default;
}

// Enhanced responsive design
@media (max-width: 991.98px) {
  .col-lg-6 {
    margin-bottom: 2rem;
  }
  
  .title {
    font-size: 2rem;
    margin-bottom: 2rem;
  }
}

@media (max-width: 576px) {
  .login-form-container {
    padding: 2rem;
    margin: 0 1rem;
    border-radius: 12px;
  }
  
  .title {
    font-size: 1.75rem;
    margin-bottom: 1.5rem;
  }
  
  .login-title {
    font-size: 1.5rem;
  }
}

// Background enhancements
.container-fluid {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
  padding: 2rem;
}

// Add subtle animations
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.row {
  animation: fadeIn 0.8s ease;
}
</style>
