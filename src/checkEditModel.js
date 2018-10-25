/*jslint browser:true*/
/*global cwAPI, jQuery, cwTabManager*/
(function(cwApi, $) {
  'use strict';
  var globalConfig = {
    flux : {
      automaticProperty: {
        name: "{libéllé} (<§application_20005_994692143§>=><§application_20006_430592262§>)",
        libéllé: "{libéllé} ({code})"
      },
      uniqueProperty: {
        code: "check_flux"
      },
      associations: {
        application_20005_994692143: {
          min: 1,
          max: 1
        },
        application_20006_430592262: {
          min: 1,
          max: 1
        }
      }      
    } 
  };

  cwApi.CwMandatoryValueChange.prototype.checkMandatoryValues = function() {
    var config,view = cwAPI.getCurrentView();
    if(view && globalConfig[view.cwView]) {
      config = globalConfig[view.cwView];
      this.modifyAutomaticProperty(config);
      this.checkNumberOfAssociation(config);
      this.checkUniqueProperties(config);
    }
    this.checkMandatoryProperties();
    this.checkMandatoryAssociations();


  };

  cwApi.CwMandatoryValueChange.prototype.modifyAutomaticProperty = function(config) {

    var propertyScriptName;
    if (config.automaticProperty) {
      for (propertyScriptName in config.automaticProperty) {
        if (config.automaticProperty.hasOwnProperty(propertyScriptName)) {
          if (this.sourceObject.properties[propertyScriptName] === undefined) {
            this.sourceObject.properties[propertyScriptName] = "";
          }
          this.pendingObject.properties[propertyScriptName] = this.getDisplayString(config.automaticProperty[propertyScriptName]);
        }
      }
    }

  };

  cwApi.CwMandatoryValueChange.prototype.getDisplayString = function(cds) {

    var prop, assoNodeID, splitPart, splitPart2, targetObjPropScriptname;
    while (cds.indexOf('<§') !== -1 && cds.indexOf('§>') !== -1) {
      assoNodeID = cds.split("<§")[1].split("§>")[0];

      if (this.pendingObject.associations[assoNodeID] && this.pendingObject.associations[assoNodeID].items.length > 0) {
        cds = cds.replace('<§' + assoNodeID + '§>', this.pendingObject.associations[assoNodeID].items[0].name);
      } else break;
    };

    while (cds.indexOf('{') !== -1 && cds.indexOf('}') !== -1) {
      prop = cds.split("{")[1].split("}")[0];

      if (this.pendingObject.properties[prop]) {
        cds = cds.replace('{' + prop + '}', this.pendingObject.properties[prop]);
      } else break;
    };

    return cds;

  };


  cwApi.CwMandatoryValueChange.prototype.addEmptyMandatoryPropertiesToList = function(propertyValue, propertyType) {
    if (this.isPropertyEmpty(propertyValue, propertyType.type)) {
      this.emptyMandatoryProperties.push(propertyType.name + " : Propriété Sans Valeur");
    }
  };

  cwApi.CwMandatoryValueChange.prototype.checkUniqueProperties = function(config) {
    var pages = {},
      propertyScriptName, propertyType, sourceIsNotNull;
    if (this.pendingObject.mandatory === undefined) this.pendingObject.mandatory = {};

    if (config.uniqueProperty) {
      for (propertyScriptName in this.pendingObject.properties) {
        if (this.pendingObject.properties.hasOwnProperty(propertyScriptName) && config.uniqueProperty.hasOwnProperty(propertyScriptName)) {
          propertyType = cwApi.mm.getProperty(this.objectTypeScriptName, propertyScriptName);

          if (this.checkPropertyUnicity(propertyScriptName, config.uniqueProperty[propertyScriptName], pages) === false) {
            this.emptyMandatoryProperties.push(propertyType.name + " : La valeur n'est pas unique");
            this.pendingObject.mandatory[propertyScriptName] = true;
          } else {
            this.pendingObject.mandatory[propertyScriptName] = false;
          }

        }
      }
    }
  };



  cwApi.CwMandatoryValueChange.prototype.checkPropertyUnicity = function(propertyScriptName, indexPage, pages, callback) {

    function getQueryStringValue(key) {
      return decodeURIComponent(window.location.search.replace(new RegExp("^(?:.*[&\\?]" + encodeURIComponent(key).replace(/[\.\+\*]/g, "\\$&") + "(?:\\=([^&]*))?)?.*$", "i"), "$1"));
    };

    var o, n, reqEnd = true;
    if (pages.hasOwnProperty(indexPage) === false) {
      reqEnd = false;
      var url = cwApi.getLiveServerURL() + "page/" + indexPage + '?' + Math.random();

      var request = new XMLHttpRequest();
      request.open('GET', url, false); // `false` makes the request synchronous
      request.send(null);

      if (request.status === 200 && status != "Ko") {
        try {
          pages[indexPage] = JSON.parse(request.responseText);
        } catch (e) {
          cwAPI.notificationManager.addError(e.message);
          return true;
        }
      }
    }

    for (n in pages[indexPage]) {
      if (pages[indexPage].hasOwnProperty(n)) {
        for (var i = 0; i < pages[indexPage][n].length; i++) {
          if (this.pendingObject.properties[propertyScriptName] === pages[indexPage][n][i].properties[propertyScriptName]) {
            if (pages[indexPage][n][i].object_id.toString() !== cwApi.cwPageManager.getQueryString().cwid) {
              return false;
            }
          }
        }
      }
    }

    return true;

  };



  cwApi.CwMandatoryValueChange.prototype.checkNumberOfAssociation = function(config) {

    var node, a, n, c, l;
    for (n in this.pendingObject.associations) {
      if (this.pendingObject.associations.hasOwnProperty(n) && config.associations.hasOwnProperty(n)) {
        node = this.pendingObject.associations[n];
        c = config.associations[n];
        l = node.items.length;
        if ((c.min && l < c.min) || (c.max && l > c.max)) {
          var associationType = cwApi.getAssociationType(n);
          this.pendingObject.associations[n].isMandatory = true;
          var message;
          if (c.min && l < c.min) message = l + " objets associés minimum : " + c.min;
          if (c.max && l > c.max) message = l + " objets associés maximum : " + c.max;
          this.emptyMandatoryAssociations.push(associationType.displayNodeName + " : " + message);

        }
      }
    }
  };

  cwApi.CwPendingChangeset.prototype.hasName = function() {
    var self = this;
    if (this.objectName === "") {
      this.propertyChanges.some(function(pc) {
        if (pc.propertyTypeScriptName === "NAME") {
          self.objectName = pc.pendingProperty.value;
          return true;
        }
      });
    }
    return this.objectName.trim() !== "";
  };


}(cwAPI, jQuery));