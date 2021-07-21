/**
 * Initialize the settings on load (register events, translate settings, initialize values).
 */
jQuery(function() {
	$.fx.off = true;

	//translate all placeholder of the options.
	TranslateHTML();

	//restore all the settings from chrome.storage.
	RestoreOptions();

	//bind the click event to the save button.
	$('button#save').on('click', function() {
		SaveOptions();
	});

	//hide the status message by default.
	$('div#status').hide();
});

/**
 * Save all settings of the extension of the form.
 * The settings are stored in the chrome.storage.
 */
function SaveOptions() {
	chrome.storage.sync.set({
    display_toolbar: $('input#display-toolbar').prop('checked')
  }, function() {

		//set the status message after saving the settings.
		const status = $('div#status');
		status.text(chrome.i18n.getMessage('options_saved'));
		status.show();

		//hide the status message after some time.
		setTimeout(function() {
			status.text('');
			status.hide();
    }, 2000);
  });
}

/**
 * Restores all settings of the extensions to the form.
 * The settings are stored in the chrome.storage.
 */
function RestoreOptions() {
  chrome.storage.sync.get({
    display_toolbar: true
  }, function(items) {
		$('input#display-toolbar').prop('checked', items.display_toolbar);
  });
}
