# backpacktf-spell-scanner
A Tampermonkey script for scanning Backpack.tf premium for spelled items.

This is a user script for Chrome's Tampermonkey extension. When running, it allows users who have Backpack.tf premium to search for spelled items by pressing ctrl+right arrow or ctr+left arrow on a Backpack.tf premium search page. 

The script can be installed automatically here: https://greasyfork.org/en/scripts/386886-backpack-tf-premium-spell-scanner

<br>
The script takes the user through each search page automatically until a spelled item is found. When a spelled item is found, a notification sound plays and the script stops on the page. 

Pressing ctrl+down arrow at any point while the script is searching will force it to stop.

The script has a config section where a user may choose to:
  - Disable the notification sound
  - Change the notification sound's volume
  - Change what notification sound plays
  - Add names of spells e.g. 'Voices From Below' to a blacklist, which forces the scanner to ignore these spells.
  - Add names of spells e.g. 'Headless Horseshoes' to a whitelist, which forces the scanner to look only for the items in the whitelist.
  - Change how long the script pauses for before going to the next page. (This delay exists to avoid sending too many requests to backpack.tf)
  
  No image of the script in action is included due to backpack.tf policy, prohibiting sharing the results of premium search.
