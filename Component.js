sap.ui.define([
	"sap/ui/core/Component",
	"sap/m/Button",
	"sap/m/Bar",
	"sap/m/MessageToast"
], function (Component, Button, Bar, MessageToast) {

	return Component.extend("f4wFlpHeader.Component", {

		metadata: {
			"manifest": "json"
		},

		init: function () {
			var that = this;
			
			var rendererPromise = this._getRenderer();
			rendererPromise.then(function (oRenderer) {
				// Get client from start_up file
				var oStartUpModel = new sap.ui.model.json.JSONModel();
				oStartUpModel.loadData("/sap/bc/ui2/start_up?", "", false);
				var clientId = oStartUpModel.getProperty("/client");
				// var clientId = "910";

				// Get launchpad logo and title for client from Fiori Frontend Server
				if( clientId ) {
					var oFlpAttrModel = that.getModel("flpattributes");
					var sPath = "/clientSet(clientId='" + clientId + "')";
					oFlpAttrModel.read(sPath, {
						success: function(oData, response) {
							// Set launchpad title
							oRenderer.setHeaderTitle(oData.title);

							// Set launchpad logo
							oRenderer.addHeaderItem("sap.ushell.ui.shell.ShellHeadItem", 
							                        { id: "f4wLogo",
							                          icon: oData.logoURL
							                        },
							                        true,   // bIsVisible: Specifies whether the header item control is displayed after being created
							                        true); 	// bCurrentState: If true then the new created control is added to the current rendered shell state	
						}
					});
				}
			});
		},

		/**
		 * Returns the shell renderer instance in a reliable way,
		 * i.e. independent from the initialization time of the plug-in.
		 * This means that the current renderer is returned immediately, if it
		 * is already created (plug-in is loaded after renderer creation) or it
		 * listens to the &quot;rendererCreated&quot; event (plug-in is loaded
		 * before the renderer is created).
		 *
		 *  @returns {object}
		 *      a jQuery promise, resolved with the renderer instance, or
		 *      rejected with an error message.
		 */
		_getRenderer: function () {
			var that = this,
				oDeferred = new jQuery.Deferred(),
				oRenderer;

			that._oShellContainer = jQuery.sap.getObject("sap.ushell.Container");
			if (!that._oShellContainer) {
				oDeferred.reject(
					"Illegal state: shell container not available; this component must be executed in a unified shell runtime context.");
			} else {
				oRenderer = that._oShellContainer.getRenderer();
				if (oRenderer) {
					oDeferred.resolve(oRenderer);
				} else {
					// renderer not initialized yet, listen to rendererCreated event
					that._onRendererCreated = function (oEvent) {
						oRenderer = oEvent.getParameter("renderer");
						if (oRenderer) {
							oDeferred.resolve(oRenderer);
						} else {
							oDeferred.reject("Illegal state: shell renderer not available after recieving 'rendererLoaded' event.");
						}
					};
					that._oShellContainer.attachRendererCreatedEvent(that._onRendererCreated);
				}
			}
			return oDeferred.promise();
		}
	});
});