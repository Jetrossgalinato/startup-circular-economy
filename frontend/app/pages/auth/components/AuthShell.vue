<template>
  <div class="flex min-h-screen flex-col bg-white text-foreground">
    <AppNavbar />

    <section class="flex flex-1 items-center justify-center px-4 py-6 sm:px-6 sm:py-8 lg:py-10">
      <div class="w-full max-w-sm sm:max-w-md">
        <slot />
      </div>
    </section>
  </div>
</template>
