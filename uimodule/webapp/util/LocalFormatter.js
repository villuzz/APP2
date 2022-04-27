sap.ui.define(["sap/ui/core/format/DateFormat"], function (DateFormat) {
    "use strict";

    return {
      visibleFrequenza: function (sValue, Control) {
        debugger
        if (sValue === Control) return true; else {return false;}
      },

      formatDate2: function (sValue) {

        if (sValue === "" || sValue === undefined || sValue === null) {
          return "";
        } else {
          jQuery.sap.require("sap.ui.core.format.DateFormat");
          var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
            pattern: "dd-MM-yyyy"
          });

          return oDateFormat.format(new Date(sValue), true);
        }
      },

      formatDate: function (value) {
        if (value === "" || value === undefined || value === null) {
          return "";
        } else {
          var options = {
            style: 'medium'
          };
          var df = DateFormat.getDateInstance(options);
          return df.format(value);

        }
      },

        existAzioni: function (sAzione) {
            if (sAzione.length === 0){
              return false;
            } else {
              return true;
            }
        },
        stripInitialChars: function (sInput) {
            return sInput !== undefined && sInput !== null ? sInput.replace(/^0+/, '') : sInput;
        },
        alphaOutput: function (sNumber) {
            return this.LocalFormatter.stripInitialChars(sNumber, "0");
        }
    };
});
