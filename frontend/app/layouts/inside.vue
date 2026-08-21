<template>
  <div class="min-h-screen bg-white text-foreground">
    <div class="mx-auto w-full max-w-lg px-4 pt-5 sm:px-6 sm:pt-6">
      <InsideHeader />
    </div>
    <main class="mx-auto w-full max-w-lg px-4 pb-28 pt-5 sm:px-6 sm:pt-6">
      <slot />
    </main>
    <InsideNavbar />
  </div>
</template>
