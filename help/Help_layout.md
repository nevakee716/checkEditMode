| **Name** | **check Edit Mode** | **Version** | 
| --- | --- | --- |
| **Updated by** | Mathias PFAUWADEL | 1.0 |


## Patch Notes

* 1.0 : 1st version working

## To be Done

* More Options
* Add Translations for IT...


## Description
Check if an object has the right number of associations, some unique property and can fill automatically some property


## Screen

Property not Unique
<img src="https://raw.githubusercontent.com/nevakee716/checkEditMode/master/screen/propUnique.jpg" alt="Drawing" style="width: 95%;"/>

Incorrect Number of Association
<img src="https://raw.githubusercontent.com/nevakee716/checkEditMode/master/screen/nbAsso.png" alt="Drawing" style="width: 95%;"/> 

Automatic Property
<img src="https://raw.githubusercontent.com/nevakee716/checkEditMode/master/screen/calc.png" alt="Drawing" style="width: 95%;"/>

## Installation  
[https://github.com/casewise/cpm/wiki](https://github.com/casewise/cpm/wiki)  

## How to set up
You can find configuration file inside
C:\Casewise\Evolve\Site\bin\webDesigner\custom\Marketplace\libs\checkEditMode\src\checkEditMode.js
 
```
  var globalConfig = {
    viewName: {
      automaticProperty: {
        propertyScriptname: "custom display string"
      },
      uniqueProperty: {
        propertyScriptname: "viewName" // should contain all the object with the property to check
      },
      associations: {
        AssociationNodeID: {
          min: minimum number of association, 
          max: maximum number of association
        }
      }      
    } 
  };
```  
If you use a tableComplexe to create an object using an objectPage, the association node is the node of the complexe table
Example :  
```
  var globalConfig = {
    flux : {
      automaticProperty: {
        name: "{libéllé} (<§application_20005_994692143§>=><§application_20006_430592262§>)"
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
```

## Result  
If the flux you want to create has a code which is already taken by another flux which is on the indexpage check_flux, you will have an error message

If you put inside the node application_20005_994692143 or application_20006_430592262, less than 1 or more than 1 application, you will have an error message

The name will be automatically fullfill with the label (associated objet of application_20005_994692143 =>  associated objet of application_20006_430592262)

##

Be carefull to save your configuration before updating to a new version