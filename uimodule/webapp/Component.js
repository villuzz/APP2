sap.ui.define([
        "sap/ui/core/UIComponent",
        "sap/ui/Device",
        "PM030/APP2/model/models"
    ],
    function (UIComponent, Device, models) {
        "use strict";

        return UIComponent.extend("PM030.APP2.Component", {
            metadata: {
                manifest: "json"
            },

            /**
             * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
             * @public
             * @override
             */
            init: function () {

                // call the base component's init function
                UIComponent.prototype.init.apply(this, arguments);

                // enable routing
                this.getRouter().initialize();

                // set the device model
                this.setModel(models.createDeviceModel(), "device");
                var that = this;
                
                $.ajax({
                  url: "/getuserinfo",
                  type: "GET",
                  dataType: "json",
                  contentType: "application/json",
                  success: function (data) {
                    var oModel = new sap.ui.model.json.JSONModel();
                    oModel.setData(data);
                    that.setModel(oModel, "UserInfo");

                  },
                  error: function (jqXHR, textStatus, errorThrown) {

                  }
              });
            }
        });
    }
);