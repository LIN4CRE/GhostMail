<script lang="ts">
  import { onMount } from 'svelte';
  import { fetchEmails, fetchLabels } from '$lib/services/gmailService';
  import SearchBar from '$lib/components/SearchBar.svelte';
  import EmailList from '$lib/components/EmailList.svelte';
  import EmailView from '$lib/components/EmailView.svelte';

  onMount(async () => {
    await fetchLabels();
    await fetchEmails('INBOX');
  });
</script>

<SearchBar />
<div class="mail-layout">
  <EmailList />
  <EmailView />
</div>

<style>
  .mail-layout {
    display: flex;
    flex: 1;
    overflow: hidden;
  }
</style>
