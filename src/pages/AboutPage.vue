<template>
  <div class="container">
    <div class="row justify-content-center">
      <div class="col-lg-10">
        <div class="text-center mb-5">
          <h1 class="display-4 mb-3">
            <i class="fas fa-heart text-danger me-3"></i>About Vue Recipes
          </h1>
          <p class="lead text-muted">Preserving family traditions, one recipe at a time</p>
        </div>
        
        <div class="row mb-5">
          <div class="col-md-8 mx-auto">
            <div class="card shadow-sm">
              <div class="card-body p-4">
                <h3 class="card-title text-center mb-4">
                  <i class="fas fa-utensils text-primary me-2"></i>Our Mission
                </h3>
                <p class="card-text text-center" v-if="aboutData">
                  {{ aboutData.summary }}
                </p>
                <p class="card-text text-center" v-else>
                  This project is all about family. Allowing you to store your traditional family recipes, 
                  be rest assured that with us your family would enjoy traditional meals for generations! 
                  Developed by a dedicated student team from Ben-Gurion University.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div class="row mb-5" v-if="aboutData?.team">
          <div class="col-12">
            <h3 class="text-center mb-4">
              <i class="fas fa-users text-success me-2"></i>Meet Our Team
            </h3>
            <div class="row justify-content-center">
              <div v-for="member in aboutData.team" :key="member.name" class="col-md-6 col-lg-4 mb-4">
                <div class="card h-100 text-center">
                  <div class="card-body">
                    <div class="avatar-placeholder mb-3">
                      <i class="fas fa-user-circle display-4 text-muted"></i>
                    </div>
                    <h5 class="card-title">{{ member.name }}</h5>
                    <p class="card-text text-muted">{{ member.role }}</p>
                    <a :href="`mailto:${member.contact}`" class="btn btn-outline-primary btn-sm">
                      <i class="fas fa-envelope me-1"></i>Contact
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="row" v-if="aboutData?.previousProjects">
          <div class="col-12">
            <h3 class="text-center mb-4">
              <i class="fas fa-code text-info me-2"></i>Previous Projects
            </h3>
            <div class="row justify-content-center">
              <div v-for="project in aboutData.previousProjects" :key="project.title" class="col-md-6 col-lg-4 mb-4">
                <div class="card h-100">
                  <div class="card-body text-center">
                    <h6 class="card-title">{{ project.title }}</h6>
                    <a :href="project.url" target="_blank" rel="noopener noreferrer" class="btn btn-outline-info btn-sm">
                      <i class="fas fa-external-link-alt me-1"></i>View Project
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="text-center mt-5">
          <div class="card bg-light">
            <div class="card-body">
              <h4 class="mb-3">
                <i class="fas fa-heart text-danger me-2"></i>Thank You!
              </h4>
              <p>Thank you for being part of our recipe-sharing community. Together, we're preserving culinary traditions for future generations.</p>
              <router-link :to="{ name: 'main' }" class="btn btn-primary">
                <i class="fas fa-home me-2"></i>Back to Recipes
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import store from '../store';

export default {
  name: "AboutPage",
  setup() {
    const aboutData = ref(null);
    const loading = ref(true);
    
    onMounted(async () => {
      try {
        const response = await axios.get(`${store.server_domain}/about`);
        aboutData.value = response.data;
      } catch (error) {
        console.error('Failed to load about data:', error);
      } finally {
        loading.value = false;
      }
    });
    
    return {
      aboutData,
      loading
    };
  }
};
</script>

<style scoped>
.avatar-placeholder {
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card {
  transition: transform 0.2s ease-in-out;
}

.card:hover {
  transform: translateY(-2px);
}

.display-4 {
  font-weight: 300;
}

.lead {
  font-size: 1.25rem;
  font-weight: 300;
}
</style>
