<template>
  <div class="register-page">
    <h1>Register</h1>
    <form @submit.prevent="register">
      <div class="form-group">
        <label>Username:</label>
        <input v-model="state.username" type="text" class="form-control" />
        <div v-if="v$.username.$error" class="text-danger">
          Username must be 3-8 alphabetic characters.
        </div>
      </div>
      <div class="form-group">
        <label>First Name:</label>
        <input v-model="state.firstname" type="text" class="form-control" />
        <div v-if="v$.firstname.$error" class="text-danger">
          First name is required.
        </div>
      </div>
      <div class="form-group">
        <label>Last Name:</label>
        <input v-model="state.lastname" type="text" class="form-control" />
        <div v-if="v$.lastname.$error" class="text-danger">
          Last name is required.
        </div>
      </div>
      <div class="form-group">
        <label>Country:</label>
        <template v-if="countries.length > 0">
          <select v-model="state.country" class="form-control" :disabled="loadingCountries">
            <option disabled value="">
              {{ loadingCountries ? "Loading countries..." : "Please select one" }}
            </option>
            <option v-for="c in countries" :key="c" :value="c">{{ c }}</option>
          </select>
        </template>
        <template v-else>
          <input v-model="state.country" type="text" class="form-control" placeholder="Enter your country" />
        </template>
        <div v-if="countriesError" class="text-danger">
          Failed to load countries. Please enter your country manually.
        </div>
        <div v-if="v$.country.$error" class="text-danger">
          Country is required.
        </div>
      </div>
      <div class="form-group">
        <label>Email:</label>
        <input v-model="state.email" type="email" class="form-control" />
        <div v-if="v$.email.$error" class="text-danger">
          A valid email is required.
        </div>
      </div>
      <div class="form-group">
        <label>Password:</label>
        <input v-model="state.password" type="password" class="form-control" />
        <div v-if="v$.password.$error" class="text-danger">
          Password must be 5-10 characters, with a digit and a special character.
        </div>
      </div>
      <div class="form-group">
        <label>Confirm Password:</label>
        <input v-model="state.confirmPassword" type="password" class="form-control" />
        <div v-if="v$.confirmPassword.$error" class="text-danger">
          Passwords must match.
        </div>
      </div>
      <div class="form-group">
        <label>Profile Picture URL:</label>
        <input v-model="state.profilePic" type="text" class="form-control" />
      </div>
      <button type="submit" class="btn btn-success mt-3">Register</button>
    </form>
  </div>
</template>

<script>
import { reactive, onMounted, ref } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { required, minLength, maxLength, sameAs, email, helpers } from '@vuelidate/validators';
import { useRouter } from 'vue-router';
import axios from 'axios';
import store from '../store';

const alpha = helpers.regex(/^[a-zA-Z]+$/);
const passwordValidator = (value) =>
  /[!@#$%^&*(),.?":{}|<>]/.test(value) && /\d/.test(value);

export default {
  name: "RegisterPage",
  setup() {
    const router = useRouter();
    const countries = ref([]);
    const loadingCountries = ref(true);
    const countriesError = ref(false);
    const state = reactive({
      username: '',
      firstname: '',
      lastname: '',
      country: '',
      email: '',
      password: '',
      confirmPassword: '',
      profilePic: ''
    });

    const rules = {
      username: { required, minLength: minLength(3), maxLength: maxLength(8), alpha },
      firstname: { required },
      lastname: { required },
      country: { required },
      email: { required, email },
      password: { required, minLength: minLength(5), maxLength: maxLength(10), passwordValidator },
      confirmPassword: { required, sameAsPassword: sameAs(() => state.password) }
    };

    const v$ = useVuelidate(rules, state);

    onMounted(async () => {
      loadingCountries.value = true;
      countriesError.value = false;
      try {
        const response = await axios.get(`${store.server_domain}/countries`);
        countries.value = response.data;
      } catch (error) {
        countriesError.value = true;
        countries.value = [];
      } finally {
        loadingCountries.value = false;
      }
    });

    const register = async () => {
      const isFormCorrect = await v$.value.$validate();
      if (isFormCorrect) {
        try {
          await axios.post(`${store.server_domain}/Register`, {
            username: state.username,
            firstname: state.firstname,
            lastname: state.lastname,
            country: state.country,
            password: state.password,
            email: state.email,
            profilePic: state.profilePic
          });
          window.toast("Registration Successful", "You can now login", "success");
          router.push('/login');
        } catch (err) {
          window.toast("Registration failed", err.response.data.message, "danger");
        }
      }
    };

    return { state, v$, register, countries, loadingCountries, countriesError };
  }
};
</script>

<style scoped>
.register-page {
  max-width: 400px;
  margin: auto;
}
</style>
