<script lang="ts">
  export let size: number = 24;
</script>

<div
  class="spinner"
  style="width: {size}px; height: {size}px; border-width: {Math.max(2, size / 10)}px"
></div>

<style>
  .spinner {
    border-style: solid;
    border-color: var(--tn-fg-muted);
    border-top-color: var(--tn-blue);
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
</style>
