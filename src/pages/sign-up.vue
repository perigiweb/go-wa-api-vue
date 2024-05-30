<template>
    <h1>Register Page</h1>
    <form>
        <input type="email" name="email" required placeholder="email">
    </form>
    <p>
        <router-link to="/">
        Back to Home
        </router-link>
        &nbsp;&mdash;&nbsp;
        <router-link to="/sign-in">
        Already have an account? Sign in here
        </router-link>
    </p>
</template>
<script>
export const routerMeta = {
    authNotRequired: true,
    redirectIfLoggedIn: '/dash'
}
</script>