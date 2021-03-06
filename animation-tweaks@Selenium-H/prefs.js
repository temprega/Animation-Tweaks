/*

Version 12.00
=============

Effect Format  [  |  S    Name     C       PPX       PPY       CX        CY        CZ        T         OP        SX        SY        PX        PY        TZ        RX        RY        RZ        TRN  ]

Read the effectParameters.txt File for details.

Credits:

This file is based on https://extensions.gnome.org/extension/1395/files-view/ by abakkk.
Application List is based on code from https://extensions.gnome.org/extension/258/notifications-alert-on-user-menu/ by hackedbellini

Some code was also adapted from the upstream Gnome Shell source code.   

*/

const ExtensionUtils    = imports.misc.extensionUtils;
const Extension         = ExtensionUtils.getCurrentExtension();
const DefaultEffectList = Extension.imports.defaultEffectsList;
const Metadata          = Extension.metadata;
const Gettext           = imports.gettext;
const Gio               = imports.gi.Gio;
const GLib              = imports.gi.GLib;
const GObject           = imports.gi.GObject;
const Gtk               = imports.gi.Gtk;
const Lang              = imports.lang;
const _                 = Gettext.domain("animation-tweaks").gettext;

const TWEEN_PARAMETERS_LENGTH = 16;
const PROFILE_FILE_NAME       = "animationTweaksExtensionProfiles.js"; 

const SETTINGS_APPLY_DELAY_TIME = 500;   
    
let settings = null;
let reloadApplicationProfileAfterSomeTime = null;
let reloadExtensionAfterSomeTime          = null;

function init() {

  ExtensionUtils.initTranslations("animation-tweaks");
  settings = ExtensionUtils.getSettings("org.gnome.shell.extensions.animation-tweaks");
  
}

function buildPrefsWidget() {

  let widget    = new Prefs_AnimationTweaksExtension();
  let switcher  = new Gtk.StackSwitcher({halign: Gtk.Align.CENTER, visible: true, stack: widget});
  
  GLib.timeout_add(GLib.PRIORITY_DEFAULT, 0, ()=> {
    widget.get_toplevel().get_titlebar().custom_title = switcher;
    return false;
  });
  
  widget.show_all();
  return widget;
  
}

function reloadExtension () {

  if(reloadExtensionAfterSomeTime != null) {
      GLib.source_remove(reloadExtensionAfterSomeTime);
      reloadExtensionAfterSomeTime = null;
  }

  if(reloadApplicationProfileAfterSomeTime != null) {
      GLib.source_remove(reloadApplicationProfileAfterSomeTime);
      reloadApplicationProfileAfterSomeTime = null;
  }
 
  reloadExtensionAfterSomeTime = GLib.timeout_add(GLib.PRIORITY_DEFAULT, SETTINGS_APPLY_DELAY_TIME, ()=> {
    settings.set_boolean("reload-signal", (settings.get_boolean("reload-signal")) ? false : true ); 
    reloadExtensionAfterSomeTime = null;
  });
    
}

function reloadApplicationProfiles() {

  if(reloadApplicationProfileAfterSomeTime != null) {
    GLib.source_remove(reloadApplicationProfileAfterSomeTime);
    reloadApplicationProfileAfterSomeTime = null;
  }

  reloadApplicationProfileAfterSomeTime = GLib.timeout_add(GLib.PRIORITY_DEFAULT, SETTINGS_APPLY_DELAY_TIME, ()=> {
    settings.set_boolean("reload-profiles-signal", (settings.get_boolean("reload-profiles-signal")) ? false : true );
    reloadApplicationProfileAfterSomeTime = null;
  });

}

const AboutPage_AnimationTweaksExtension =  new GObject.Class({

  Name: 'AboutPage_AnimationTweaksExtension',
  Extends: Gtk.ScrolledWindow,

  _init: function(params) {
  
    this.parent();
    
  },
    
  keepPreferences: function(dialog) {
  
    settings.set_int("current-version", Metadata.version);
    reloadExtension();
    this.updateDone();
    dialog.destroy();
    
  },
  
  resetExtension: function() {
  
    settings.reset('normal-open');
    settings.reset('normal-close');
    settings.reset('normal-minimize');
    settings.reset('normal-unminimize');
    settings.reset('normal-movestart');
    settings.reset('normal-focus');
    settings.reset('normal-defocus');

    settings.reset('dialog-open');
    settings.reset('dialog-close');
    settings.reset('dialog-minimize');
    settings.reset('dialog-unminimize');
    settings.reset('dialog-movestart');
    settings.reset('dialog-focus');
    settings.reset('dialog-defocus');

    settings.reset('modaldialog-open');
    settings.reset('modaldialog-close');
    settings.reset('modaldialog-minimize');
    settings.reset('modaldialog-unminimize');
    settings.reset('modaldialog-movestart');
    settings.reset('modaldialog-focus');    
    settings.reset('modaldialog-defocus');    
    
    settings.reset('dropdownmenu-open');
    settings.reset('popupmenu-open');
    settings.reset('combo-open');
    settings.reset('splashscreen-open');
    settings.reset('tooltip-open');
    settings.reset('overrideother-open');
    
    settings.reset("notificationbanner-open");
    settings.reset("notificationbanner-close");
    
    settings.reset("padosd-open");
    settings.reset("padosd-close");
    
    settings.reset("toppanelpopupmenu-open");
    settings.reset("toppanelpopupmenu-close"); 
    
    settings.reset("desktoppopupmenu-open");
    settings.reset("desktoppopupmenu-close");        
    
    settings.reset('opening-effect');
    settings.reset('closing-effect');
    settings.reset("minimizing-effect");
    settings.reset("unminimizing-effect");
    settings.reset("moving-effect");
    settings.reset("focussing-effect");
    settings.reset("defocussing-effect");
        
    settings.reset("use-application-profiles");
    settings.reset("application-list");
    settings.reset("name-list");
   
    settings.reset('wayland');
    settings.reset("padosd-hide-timeout");
    settings.reset("notificationbanner-pos");
    
    settings.set_int("current-version", Metadata.version);
    
    reloadExtension();
    
  },
    
  showInfo: function(mode=false){
  
    this.vbox                 = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL, margin: 30 });
    let imageBox              = new Gtk.Box();
    let image                 = new Gtk.Image({ file: Extension.dir.get_child('eicon.png').get_path(), pixel_size: 96 });
    
    this.firstInfo            = new Gtk.Label({ wrap: true, justify: 2, use_markup: true, label: "<big><b>" + Metadata.name + "</b></big>\n" +"<small>Version  "+ Metadata.version +" "+Metadata.status+"</small>\n\n" +_(Metadata.description)+"\n\n\n\n\n<span size=\"small\">"+_("This program comes with ABSOLUTELY NO WARRANTY.\nSee the")+" <a href=\"https://www.gnu.org/licenses/old-licenses/gpl-2.0.html\">GNU General Public License, version 2 or later</a>"+_("for details.")+"</span>\n"});  
    this.resetExtensionButton = new Gtk.Button({label: _("Reset Animation Tweaks Extension"),halign:Gtk.Align.CENTER});
    
    this.resetExtensionButton.connect('clicked', ()=> {this.resetExtension(); this.updateDone(mode);});

    imageBox.set_center_widget(image);
    this.vbox.pack_start(imageBox,                  false, false, 0);
    this.vbox.pack_start(this.firstInfo,            false, false, 0);
    this.vbox.pack_start(this.resetExtensionButton, false, false, 0);
    this.add(this.vbox);

    if(mode != false) {
      this.secondInfo = new Gtk.Label({ wrap: true, justify: 2, use_markup: true, label: "\n\n"+_("If already upgraded to Version 10 or higher and it's working fine, you can keep the preferences as it is.\nIn that case click on the button below. Otherwise click the above button to reset.")+"\n\n"});
      this.firstInfo.label =  _("Extension is upgraded to Version  ")+ Metadata.version+"\n\n" + _("A Reset to default preferences is needed if upgrading from a version older than version 10 or unable to reset during previous upgrade to version 10. Please Reset the extension by clicking the button below.")+"\n\n";
      this.upgradeFormVersion10 = new Gtk.Button({label: _("Upgrade From Version 10 or newer."),halign:Gtk.Align.CENTER});
      this.upgradeFormVersion10.connect('clicked', ()=> this.showVersion10Options());
      
      this.vbox.pack_start(this.secondInfo,           false, false, 0);
      this.vbox.pack_start(this.upgradeFormVersion10, false, false, 0);   
    }
    
  },

  showVersion10Options: function() {
  
    let dialog = new Gtk.Dialog({ title: _("Upgrade From Version 10 or newer"),transient_for: this.get_toplevel(),use_header_bar: true,modal: true });
  
    dialog.set_default_response(Gtk.ResponseType.OK);
    dialog.add_button(Gtk.STOCK_CANCEL, Gtk.ResponseType.CANCEL);
 
    let textBox = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL });
    let text    = new Gtk.Label({ wrap: true, justify: 2, use_markup: true, label: "<big><b>"+_("Please make sure")+"</b></big>"});
    let text1   = new Gtk.Label({ wrap: true, justify: 3, use_markup: true, label: "\n\n"+_("You are upgrading from version 10 or newer of this extension to current version.\nAlready Reset the extension during previous upgrade.\nThe extension is working fine.")});
    let text2   = new Gtk.Label({ wrap: true, justify: 2, use_markup: true, label: "\n\n<big><b>"+_("Otherwise click Cancel to go back and reset.")+"</b></big>"});
    let upgradeFormVersion10Button = new Gtk.Button({label: _("Keep Preferences and Upgrade"),halign:Gtk.Align.CENTER });
    upgradeFormVersion10Button.connect('clicked', ()=> this.keepPreferences(dialog));
    textBox.pack_start(text,  false, false, 0);
    textBox.pack_start(text1, false, false, 0);
    textBox.pack_start(text2, false, false, 0);
    
    let vbox = new Gtk.Box({orientation: Gtk.Orientation.VERTICAL,margin: 5});
    vbox.pack_start(textBox, true, true, 0);
    vbox.pack_start(upgradeFormVersion10Button, false, false, 0);

    dialog.get_content_area().pack_start(vbox, true, true, 0);
    dialog.connect('response', Lang.bind(this, function(dialog, id) {
      if(id != Gtk.ResponseType.OK) {
        dialog.destroy();
        return;
      }

      dialog.destroy();
    }));
    
    dialog.show_all();
    
  },
    
  updateDone: function(mode) {
  
    if(mode == false) {
      return;
    }
    
    this.secondInfo.destroy();
    this.resetExtensionButton.destroy();
    this.upgradeFormVersion10.destroy();
    
    this.firstInfo.label =_("Version  ")+ Metadata.version+"\n\n <big><b> "+_("Upgraded Successfully")+"</b></big>";
    settings.set_int("current-version", parseInt(Metadata.version));
  
  },
  
});

const AnimationSettingsForItem_AnimationTweaksExtension = new GObject.Class({

  Name: 'AnimationSettingsForItem_AnimationTweaksExtension',

  _init( itemType, windowType, action, grid, posY, topLevel, thisIsPairedEffect = false ) {
   
    this.action         =  action;
    this.itemType       =  itemType;
    this.windowType     =  windowType;
    this.appIndex       =  0;
    this.KEY            =  this.windowType+"-"+this.action;
    this.allEffectsList =  new EffectsList_AnimationTweaksExtension(this.itemType+"-"+this.action+"-effects-list");   
    this.appProfile     =  new EffectsList_AnimationTweaksExtension(this.KEY);
    this.eStr           =  this.eStr = this.appProfile.getEffectAt(this.appIndex);
    
    this.prefsLabel     =  new Gtk.Label({xalign: 1, label:_(settings.settings_schema.get_key(this.KEY).get_summary()), halign: Gtk.Align.START});
    this.prefsCombo     =  new Gtk.ComboBoxText({hexpand: false,vexpand:false});
    this.tweakButton    =  new Gtk.Button({label: "☰",halign:Gtk.Align.START});
    this.timeSetting    =      Gtk.SpinButton.new_with_range(10,10000,10);
    this.prefsSwitch    =  new Gtk.Switch({hexpand: false,vexpand:false,active: (this.eStr[0]=='T')? true:false,halign:Gtk.Align.CENTER});
    this.prefsSwitchBox =  new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL, margin: 0,hexpand:true});
    
    this.prefsSwitchBox.add(this.prefsSwitch);

    grid.attach(this.prefsLabel,     0, posY, 1, 1);
    grid.attach(this.prefsCombo,     1, posY, 1, 1);
    grid.attach(this.tweakButton,    2, posY, 1, 1);  
    grid.attach(this.timeSetting,    3, posY, 1, 1);
    grid.attach(this.prefsSwitchBox, 4, posY, 1, 1);
    
    this.allEffectsList.loadEffectsListToComboBox(this.prefsCombo);
    
    this.prefsCombo.connect('changed',         (widget) => this.selectEffectFromList(widget.get_active()));
    this.timeSetting.connect('notify::value',  (spin  ) => this.changeEffectTime(spin.get_value_as_int()));
    this.prefsSwitch.connect('notify::active', (      ) => this.toggleItemStatus(this.prefsSwitch.active));  
    this.tweakButton.connect('clicked',        (      ) => this.effectsTweaks(topLevel, thisIsPairedEffect));  
    
    settings.connect("changed::"+this.KEY,     (      ) => this.updateValues(this.appIndex));
    this.updateValues(this.appIndex);

  },
  
  changeEffectTime: function(value) {

    if(this.updatingProfiles==true || this.appIndex ==-1 ) {
      return;
    }

    this.eStr = this.appProfile.getEffectAt(this.appIndex);
    this.appProfile.modifyEffectForWindowAction(this.appIndex,this.allEffectsList.setEffectTime(value, this.eStr));
   
  },
  
  effectsTweaks : function(topLevel, thisIsPairedEffect) {

    let dialog = new Gtk.Dialog({title:_("Customize Animation") + "  -  «" + _(this.eStr[1]) + "»",
                                 transient_for: topLevel.get_toplevel(),
                                 use_header_bar: true,modal:true});
    dialog.get_content_area().pack_start(new EffectsTweaks_AnimationTweaksExtension(this.appProfile, this.appIndex, thisIsPairedEffect), true, true, 0)

    dialog.set_default_response(Gtk.ResponseType.CANCEL);
    let addButton = dialog.add_button(_("Restore Default"), Gtk.ResponseType.OK);
    dialog.connect('response', Lang.bind(this, function(dialog, id) { 

      if(id == Gtk.ResponseType.OK) {
        this.selectEffectFromList(this.prefsCombo.get_active());
      }
      dialog.destroy();

    }));
    dialog.show_all();

  },
    
  selectEffectFromList: function(selectedIndex) {

    if(this.updatingProfiles==true || this.appIndex ==-1 ) {
      return;
    }

    this.eStr    = this.appProfile.getEffectAt(this.appIndex);
    let state    = this.eStr[0];
    this.eStr    = [];
    this.eStr[0] = state;

    let selectedEffectFromList = this.allEffectsList.getEffectAt(selectedIndex);
    let i                      = 1;

    while(i!= selectedEffectFromList.length+1) {
      this.eStr[i] = selectedEffectFromList[i-1];
      i++;
    }

    this.appProfile.modifyEffectForWindowAction(this.appIndex,this.eStr);
    reloadApplicationProfiles();
    
  },
  
  toggleItemStatus: function(state) {
  
    if(this.updatingProfiles==true || this.appIndex ==-1 ) {
      return;
    }
      
    this.eStr = this.appProfile.getEffectAt(this.appIndex);
    this.eStr[0] = (state)? "T":"F";
    this.appProfile.modifyEffectForWindowAction(this.appIndex,this.eStr);
    reloadApplicationProfiles();
 
  },

  updateValues: function(appIndex) {
  
    this.updatingProfiles = true;
    
    this.appProfile.reloadList(this.windowType+"-"+this.action);
    this.appIndex = appIndex;
    
    this.eStr = (this.appIndex == -1)? this.appProfile.getEffectAt(0) : this.appProfile.getEffectAt(this.appIndex);

    this.prefsSwitch.active = (this.eStr[0]=="T")? true:false;
    this.prefsCombo.set_active(this.allEffectsList.getIndexOf(this.eStr[1]));
    this.timeSetting.set_value(this.allEffectsList.getTotalTimeOf(this.eStr));
    
    this.updatingProfiles = false;
  
  },
  
});

const AnimationSettingsForItemProfile_AnimationTweaksExtension = new GObject.Class({

  Name: 'AnimationSettingsForItemProfile_AnimationTweaksExtension',
  Extends: AnimationSettingsForItem_AnimationTweaksExtension,
  
  _init(itemType,windowType,action,grid,posY,topLevel,thisIsPairedEffect=false) {
  
    this.parent(itemType,windowType,action,grid,posY,topLevel,thisIsPairedEffect);
    this.prefsLabel.label = _(this.action.charAt(0).toUpperCase()+this.action.slice(1));
    this.updateValues(-1);
  
  },
  
});

const Prefs_AnimationTweaksExtension = new GObject.Class({

  Name: 'Prefs_AnimationTweaksExtension',
  Extends: Gtk.Stack,
    
  _init: function() {

    this.actionPrefs  = new PrefsWindowForAction_AnimationTweaksExtension();    
    this.profilePrefs = new PrefsWindowForProfiles_AnimationTweaksExtension();
    this.tweaksPrefs  = new PrefsWindowForTweaks_AnimationTweaksExtension();
    this.aboutPage    = new AboutPage_AnimationTweaksExtension();
    
    let previousVersion = settings.get_int("current-version");
    
    this.parent({ transition_type: 6  ,transition_duration: 200 });
    
    ( previousVersion < Metadata.version ) ? this.add_titled( this.aboutPage, "Update", _("Update") ) : null;  
    
    this.add_titled(this.actionPrefs,  "Actions",  _("Actions") );
    this.add_titled(this.profilePrefs, "Profiles", _("Profiles"));
    this.add_titled(this.tweaksPrefs,  "Tweaks",   _("Tweaks")  );
    
    if( previousVersion == Metadata.version ) {
      this.add_titled( this.aboutPage, "About", _("About") );
      this.aboutPage.showInfo();
    }
    else {
      this.aboutPage.showInfo(true);
    }
      
    this.tweaksPrefs.displayPrefs();

  },

});

const EffectsList_AnimationTweaksExtension = new GObject.Class({

  Name: 'EffectsList_AnimationTweaksExtension',
    
  _init: function(KEY) {
  
    this.reloadList(KEY);
    this.modifyAfterSomeTime = null;
    
  },
  
  addDefaultEffectForWindowAction: function() {
  
    let windowOpenEffect = this.getEffectAt(0);
        
    this.effectsList.push("|");
    
    for(let i=0;i<windowOpenEffect.length;i++) {
      this.effectsList.push(windowOpenEffect[i]);
    }
    
    settings.set_strv(this.KEY,this.effectsList);
    
  },

  extractEffect: function(startIndex,endIndex) {
  
    let eStr=[];
  
    while(startIndex <= endIndex) {
      eStr.push(this.effectsList[startIndex]);
      startIndex++;
    }
    
    return eStr;
  
  },
  
  getEffectAt: function(index) {
    
    let effectIndex = 0;
    let startIndex  = 0;
    let endIndex    = this.getEndIndex(startIndex);
    let eStr        = [];
   
    while(startIndex!=-1) {
    
      if(effectIndex == index) {
        startIndex++;
        return this.extractEffect(startIndex,endIndex);
      }
      
      effectIndex++;
      startIndex = this.effectsList.indexOf('|',startIndex+1);
      endIndex   = this.getEndIndex(startIndex);
      
    } 
    
    return eStr;

  },
  
  getEndIndex: function(startIndex) {
  
    let endIndex = this.effectsList.indexOf('|',startIndex+1);
        
    if(endIndex == -1) {
      endIndex = this.effectsList.length;
    }  
    
    return --endIndex;

  },
  
  getIndexOf: function(effectName) {
  
    let listIndex   = 0;
    let effectIndex = 0;

    while(listIndex!=-1) {

      if(this.effectsList[listIndex+1] == effectName) {
        return effectIndex;
      }
      effectIndex++;
      listIndex = this.effectsList.indexOf('|',listIndex+1);
      
    } 
    
    return -1;

  },

  getTotalTimeOf: function(eStr) {

    let cIndex    = 8;
    let totalTime = 0; 

    for (cIndex;cIndex<eStr.length;cIndex=cIndex+TWEEN_PARAMETERS_LENGTH) {
      totalTime += (eStr[cIndex]>"0.010") ? parseFloat(eStr[cIndex]) : 0;
    }
  
    return totalTime*1000;

  },  
  
  loadEffectsListToComboBox: function(effectsCombo) {
  
    let cIndex = 0;

     while(cIndex!=-1) {
       effectsCombo.append(this.effectsList[cIndex+1],_(this.effectsList[cIndex+1]));
       cIndex = this.effectsList.indexOf('|',cIndex+1);
     } 
     
  },

  modifyEffectForWindowAction: function(appIndex,eStr) {
    
    if(this.modifyAfterSomeTime != null) {
      GLib.source_remove(this.modifyAfterSomeTime);
      this.modifyAfterSomeTime = null;
    }
    
    this.modifyAfterSomeTime = GLib.timeout_add(GLib.PRIORITY_DEFAULT, SETTINGS_APPLY_DELAY_TIME, ()=> {
    
      this.modifyAfterSomeTime = null;
  
      let windowOpenEffect = eStr;  
      let effectIndex = 0;
      let startIndex  = 0;
      let endIndex    = this.getEndIndex(startIndex);
   
      windowOpenEffect.splice(0,0,"|");
   
      while(startIndex!=-1) {
    
        if(effectIndex == appIndex) {

          for(let i=0;i<windowOpenEffect.length;i++) {
            this.effectsList.splice(startIndex+i,0,windowOpenEffect[i]);
          }
          settings.set_strv(this.KEY,this.effectsList); 
          reloadApplicationProfiles(); 
          this.removeEffectForWindowAction(appIndex+1); 
          windowOpenEffect.splice(0,1);
        
          return;
        
        }
      
        effectIndex++;
        startIndex = this.effectsList.indexOf('|',startIndex+1);
        endIndex   = this.getEndIndex(startIndex);
      
      } 
    
      windowOpenEffect.splice(0,1);
      
    });
        
  },

  reloadList: function(KEY,TYPE) {
    
    this.KEY = KEY;

    switch(this.KEY) {
      case "window-open-effects-list" : 
        this.effectsList = DefaultEffectList.windowOpenEffectsList;
        break;

      case "other-open-effects-list" : 
        this.effectsList = DefaultEffectList.otherOpenEffectsList;
        break;

      case "notificationbanner-open-effects-list" : 
        this.effectsList = DefaultEffectList.notificationbannerOpenEffectsList;
        break;

      case "padosd-open-effects-list" : 
        this.effectsList = DefaultEffectList.padosdOpenEffectsList;
        break;

      case "window-close-effects-list" : 
        this.effectsList = DefaultEffectList.windowCloseEffectsList;
        break;

      case "notificationbanner-close-effects-list" : 
        this.effectsList = DefaultEffectList.notificationbannerCloseEffectsList;
        break;
        
      case "padosd-close-effects-list" : 
        this.effectsList = DefaultEffectList.padosdCloseEffectsList;
        break;

      case "other-close-effects-list" : 
        this.effectsList = DefaultEffectList.otherCloseEffectsList;
        break;
     
      case "window-minimize-effects-list" : 
        this.effectsList = DefaultEffectList.windowMinimizeEffectsList;
        break;
  
      case "window-unminimize-effects-list" : 
        this.effectsList = DefaultEffectList.windowUnminimizeEffectsList;
        break;

      case "window-movestart-effects-list" :
        this.effectsList = DefaultEffectList.windowMovestartEffectsList;
        break;
        
      case "window-focus-effects-list" :
        this.effectsList = DefaultEffectList.windowFocusEffectsList;
        break;

      case "window-defocus-effects-list" :
        this.effectsList = DefaultEffectList.windowDefocusEffectsList;
        break;
     
      default: 
        this.effectsList = settings.get_strv(this.KEY);
        
    }
     
  },
  
  removeEffectForWindowAction: function(appIndex) {
  
    let effectIndex = 0;
    let startIndex  = 0;
    let endIndex    = this.getEndIndex(startIndex);
   
    while(startIndex!=-1) {
    
      if(effectIndex == appIndex) {
        this.effectsList.splice(startIndex,(endIndex-startIndex+1));
        settings.set_strv(this.KEY,this.effectsList); 
        return;
      }
      
      effectIndex++;
      startIndex = this.effectsList.indexOf('|',startIndex+1);
      endIndex   = this.getEndIndex(startIndex);
    } 
    
  },
  
  setEffectTime: function(value,eStr) {

    let cIndex    = 8;
    let totalTime = this.getTotalTimeOf(eStr); 

    for (let pIndex = cIndex;pIndex <eStr.length;pIndex=pIndex+TWEEN_PARAMETERS_LENGTH) {
      if(eStr[pIndex] > "0.010"){
        eStr[pIndex] = (((parseFloat(eStr[pIndex])*value)/totalTime).toPrecision(3)>="0.020") ? ((parseFloat(eStr[pIndex])*value)/totalTime).toPrecision(3).toString() : "0.020";
      }
    }  
  
    return eStr;

  },
  
});

const  EffectsTweaks_AnimationTweaksExtension =  new GObject.Class({

  Name: 'EffectsTweaks_AnimationTweaksExtension',
  Extends: Gtk.ScrolledWindow,

  _init: function(appProfile,appIndex, messageForPairedEffects=false) {

    this.parent({hscrollbar_policy:2});
    this.set_min_content_height(500); 
    
    this.gridWin = new Gtk.Grid({ column_spacing: 30, halign: Gtk.Align.CENTER, margin: 20, row_spacing: 15 ,border_width:20});
    this.gridWin.attach(new Gtk.Label({xalign:1,use_markup:true,label:"<big><b>"+_("Any  Changes  done  here  are  Applied  immediately")+"</b></big>",halign: Gtk.Align.CENTER}),0,0,3,1);
    this.gridWin.attach(new Gtk.Label({xalign:1,use_markup:true,label:_("Details of parameter values are described in")+"  <i>effectParameters.txt</i>  "+_("file  in  extension folder."),halign: Gtk.Align.CENTER }) ,0  ,1 ,3  ,1); 
    this.add(this.gridWin);        
    
    this.appIndex = appIndex;
    this.appProfile = appProfile;
    this.eStr = (this.appIndex == -1)? this.appProfile.getEffectAt(0):this.appProfile.getEffectAt(this.appIndex);
    
    let i=2;
    let pos=3;

    if(messageForPairedEffects==true) {

      this.gridWin.attach(new Gtk.Label({xalign:1,use_markup:true,label:" ",halign: Gtk.Align.CENTER }) ,0  ,++pos ,1  ,1);
      this.gridWin.attach(new Gtk.Label({xalign:1,use_markup:true,label:"<big><b><u>"+_("Parameters for Starting Effect")+"</u></b></big>", halign: Gtk.Align.CENTER }) ,0  ,++pos ,3  ,1);
    
    }

    while(i<TWEEN_PARAMETERS_LENGTH*this.eStr[2]) {
    
      this.gridWin.attach(new Gtk.Label({xalign:1,use_markup:true,label:" ",halign: Gtk.Align.CENTER }) ,0  ,++pos ,1  ,1);
      this.gridWin.attach(new Gtk.Label({xalign:1,use_markup:true,label:"<big><b><u>"+(_("Tween Parameters - ")+((i-2)/TWEEN_PARAMETERS_LENGTH+1))+"</u></b></big>", halign: Gtk.Align.CENTER }) ,0  ,++pos ,3  ,1);
      this.gridWin.attach(new Gtk.Label({xalign:1,use_markup:true,label:" ",halign: Gtk.Align.CENTER }) ,0  ,++pos ,1  ,1);
       
      this.tweakParameter(         ++i, _("Pivot Point X")+"\t\t\t"+"["+"\t"+_("-500  -  500")+"\t%\t\t"+"]",                 ++pos, -500,  500,     100                            );
      this.tweakParameter(         ++i, _("Pivot Point Y")+"\t\t\t"+"["+"\t"+_("-500  -  500")+"\t%\t\t"+"]",                 ++pos, -500,  500,     100                            );
      this.tweakParameter(         ++i, _("Rotation Center X")+"\t\t"+"["+"\t"+_("0  -  100")+"\t%\t\t"+"]",                  ++pos, 0,     100,     100                            );
      this.tweakParameter(         ++i, _("Rotation Center Y")+"\t\t"+"["+"\t"+_("0  -  100")+"\t%\t\t"+"]",                  ++pos, 0,     100,     100                            );
      this.tweakParameter(         ++i, _("Rotation Center Z")+"\t\t"+"["+"\t"+_("0  -  100")+"\t%\t\t"+"]",                  ++pos, 0,     100,     100                            );
      this.tweakParameter(         ++i, _("Time")+"\t\t\t\t\t"+"["+"\t"+_("in milliseconds")+"\t"+"]",                        ++pos, 1,     10000,   1000                           ); 
      this.tweakParameter(         ++i, _("Ending Opacity")+"\t\t"+"["+"\t"+_("0  -  255")+"\t\t\t"+"]",                      ++pos, 0,     255,     1                              );
      this.tweakParameterDim(      ++i, _("Ending Width")+"\t\t\t"+"["+"\t"+_("0  -  200")+"\t%\t\t"+"]",                     ++pos, 0,     200,     100, ["MW"]                    );
      this.tweakParameterDim(      ++i, _("Ending Height")+"\t\t\t"+"["+"\t"+_("0  -  200")+"\t%\t\t"+"]",                    ++pos, 0,     200,     100, ["MH"]                    );
      this.tweakParameterPosition( ++i, _("Movement along X")+"\t"+"["+"\t"+_("0 ± % Screen width from current X→")+"\t"+"]", ++pos, -100,  100,     100, ["MX","LX","RX","SX","IX"]);
      this.tweakParameterPosition( ++i, _("Movement along Y")+"\t[\t"+_("0 ± % Screen height from current Y↓")+"\t]",         ++pos, -100,  100,     100, ["MY","DY","UY","SY","IY"]);
      this.tweakParameter(         ++i, _("Movement along Z")+"\t[\t"+_("0 ± % Screen height from current Z")+"\t]",          ++pos, -100,  100,     100,                           );
      this.tweakParameter(         ++i, _("Rotation about X")+"\t\t[\t"+_("in Degree")+"\t%\t\t]",                            ++pos, -3600, 3600,    1                              );
      this.tweakParameter(         ++i, _("Rotation about Y")+"\t\t[\t"+_("in Degree")+"\t%\t\t]",                            ++pos, -3600, 3600,    1                              );
      this.tweakParameter(         ++i, _("Rotation about Z")+"\t\t[\t"+_("in Degree")+"\t%\t\t]",                            ++pos, -3600, 3600,    1                              );
      this.tweakTransitionType(    ++i, _("Transition Type")+"\t\t",                                                          ++pos                                                 );

      if(messageForPairedEffects==true && i == (TWEEN_PARAMETERS_LENGTH*this.eStr[2]*0.5)+2) {
      
        this.gridWin.attach(new Gtk.Label({xalign:1,use_markup:true,label:" ",halign: Gtk.Align.CENTER }) ,0  ,++pos ,1  ,1);
        this.gridWin.attach(new Gtk.Label({xalign:1,use_markup:true,label:"<big><b><u>"+_("Parameters for Ending Effect")+"</u></b></big>", halign: Gtk.Align.CENTER }) ,0  ,++pos ,3  ,1);
    
      }

    }
    
  },
  
  filterInvalidValues: function(checkForThisValue,minPV,maxPV,acceptableValues,temp,multiplier) {

    for(let i=0;i<acceptableValues.length;i++){
      if(checkForThisValue==acceptableValues[i]){
        return [checkForThisValue,checkForThisValue,true]; 
      }
    }
    
    if(checkForThisValue == "") {
      return [(minPV/multiplier).toString(),minPV.toString(),false,false];  
    }
    
    let value = parseFloat(checkForThisValue)*temp;
    
    if(isNaN(value)) {
      return [(minPV/multiplier).toString(),minPV.toString(),false,false];  
    }
    
    if(value >= minPV && value <= maxPV) {
      return [(value/multiplier).toString(),value.toString(),true,false];
    }
    
    if(value > maxPV) {
      return [(maxPV/multiplier).toString(),maxPV.toString(),true,true];
    }

    if(value < minPV) {
      return [(minPV/multiplier).toString(),minPV.toString(),true,true];
    }

    return [(minPV/multiplier).toString(),minPV.toString(),false,false];
    
  },

  tweakParameter : function(pNo,INFO,pos,minPV,maxPV,multiplier) {
  
    let SettingLabel    = new Gtk.Label({ xalign:  1, label: INFO,halign: Gtk.Align.START });  
    let effectParameter = Gtk.SpinButton.new_with_range(minPV,maxPV,1);
    
    effectParameter.set_value(parseFloat(this.eStr[pNo])*multiplier);
    effectParameter.connect('notify::value', (spin)=> {     
      this.eStr[pNo]=(spin.get_value_as_int()/multiplier).toString();
      this.appProfile.modifyEffectForWindowAction(this.appIndex,this.eStr);
      reloadApplicationProfiles();
    });
    this.gridWin.attach(SettingLabel    ,0    ,pos  ,1   ,1);
    this.gridWin.attach(effectParameter ,2    ,pos  ,1   ,1);
    
  },
  
  tweakTransitionType: function(pNo,INFO,pos) {
                   
    let SettingLabel   = new Gtk.Label({ xalign:  1, label: INFO,halign: Gtk.Align.START });  
    let effectParameter = new Gtk.ComboBoxText();
    for (let i = 0; i < DefaultEffectList.transitionOptions.length; i++) {
      effectParameter.append(DefaultEffectList.transitionOptions[i],  DefaultEffectList.transitionOptions[i]);
    }
    effectParameter.set_active(DefaultEffectList.transitionOptions.indexOf(this.eStr[pNo]));
    effectParameter.connect('changed', Lang.bind(this, function(widget) {
      
      this.eStr[pNo]=DefaultEffectList.transitionOptions[widget.get_active()];
      this.appProfile.modifyEffectForWindowAction(this.appIndex,this.eStr);
      reloadApplicationProfiles();
            
    }));
    
    this.gridWin.attach(SettingLabel,    0, pos, 1, 1);
    this.gridWin.attach(effectParameter, 2, pos, 1, 1);
    
  },
  
  tweakParameterDim : function(pNo,INFO,pos,minPV,maxPV,multiplier,acceptableValues) {

    let SettingLabel   = new Gtk.Label({ xalign:  1, label: INFO,halign: Gtk.Align.START });  
    let effectParameter   = new Gtk.Entry({text: this.filterInvalidValues( this.eStr[pNo],minPV,maxPV,acceptableValues,multiplier,multiplier)[1] });

    effectParameter.connect('changed', ()=> {     
     
      let value="" ; 
      let shouldCommit = false;
      let shouldOverrideText = false;
        
      if(parseFloat(effectParameter.text) > maxPV){
        effectParameter.text = maxPV.toString();
        this.eStr[pNo] = (maxPV/multiplier).toString();
        shouldCommit = true;
      }
      else {
        [this.eStr[pNo],value, shouldCommit, shouldOverrideText] = this.filterInvalidValues( effectParameter.text , minPV , maxPV,acceptableValues,1,multiplier);
      }
        
      if(shouldOverrideText == true){
        effectParameter.text = value;
      }
        
      if(shouldCommit == true){
        this.appProfile.modifyEffectForWindowAction(this.appIndex,this.eStr);
        reloadApplicationProfiles();
      }
     
    });

    this.gridWin.attach(SettingLabel,    0, pos, 1, 1);
    this.gridWin.attach(effectParameter, 2, pos, 1, 1);

  }, 

  tweakParameterPosition : function(pNo,INFO,pos,minPV,maxPV,multiplier,acceptableValues) {

    let SettingLabel    = new Gtk.Label({ xalign:  1, label: INFO,halign: Gtk.Align.START });  
    let effectParameter = new Gtk.Entry({text: this.filterInvalidValues( this.eStr[pNo],minPV,maxPV,acceptableValues,multiplier,multiplier)[1] });

    effectParameter.connect('changed', ()=> {     
     
      let value="" ; 
      let shouldCommit = false;
      let shouldOverrideText = false;
        
      if(effectParameter.text.length > 3){
        effectParameter.text = maxPV.toString();
        this.eStr[pNo] = (maxPV/multiplier).toString();
        shouldCommit = true;
      }
      else {
        [this.eStr[pNo],value, shouldCommit, shouldOverrideText] = this.filterInvalidValues( effectParameter.text , minPV , maxPV,acceptableValues,1,multiplier);
      }
        
      if(shouldOverrideText == true){
        effectParameter.text = value;
      }
        
      if(shouldCommit == true){
        this.appProfile.modifyEffectForWindowAction(this.appIndex,this.eStr);
        reloadApplicationProfiles();
      }
     
    });

    this.gridWin.attach(SettingLabel,    0, pos, 1, 1);
    this.gridWin.attach(effectParameter, 2, pos, 1, 1);

  }, 

});

const PrefsWindow_AnimationTweaksExtension = new GObject.Class({

  Name: 'PrefsWindow_AnimationTweaksExtension',
  Extends: Gtk.Grid,

  _init: function(action) {
      
    this.parent({ column_spacing: 40, halign: Gtk.Align.CENTER, margin: 20,margin_top:0, row_spacing: 20 ,border_width:20});
    this.addGrids();
    this.action = action;
     
  },

  addGrids: function() {

    this.switchBox0 = new Gtk.Grid({ column_spacing: 30, halign: Gtk.Align.CENTER, margin: 20, margin_top: 10, row_spacing: 0  ,border_width:0 });
    this.switchBox1 = new Gtk.Grid({ column_spacing: 30, halign: Gtk.Align.CENTER, margin: 20,                 row_spacing: 0  ,border_width:0 });
    
    this.attach(this.switchBox0, 0, 0,  5, 1);
    this.attach(this.switchBox1, 0, 10, 5, 1);

  },
 
  heading: function(posY,grid=this) {
  
    grid.attach(new Gtk.Label({ xalign: 1, label: _("Items"), halign: Gtk.Align.CENTER }),          0, posY, 1, 1);
    grid.attach(new Gtk.Label({ xalign: 1, label: _("Effect"), halign: Gtk.Align.CENTER }),         1, posY, 1, 1);
    grid.attach(new Gtk.Label({ xalign: 1, label: _("Time [ in ms ]"), halign: Gtk.Align.CENTER }), 3, posY, 1, 1);
    grid.attach(new Gtk.Label({ xalign: 1, label: _("Status"), halign: Gtk.Align.CENTER }),         4, posY, 1, 1);
    
  },
  
  emptyLine: function(posY) {
  
    this.attach(new Gtk.Label({ xalign: 1, label: "" ,halign: Gtk.Align.CENTER }) ,0  ,posY ,1  ,1);
    
  },

  insertSpace: function(LABEL,posX,posY,sBox) {
  
    sBox.attach(new Gtk.Label({ xalign: 1, label: LABEL ,halign: Gtk.Align.CENTER }), posX, posY, 1, 1);
    
  },
  
  prefsWA: function(KEY,posX,posY,sbox,space=1) {
  
    let SettingLabel0  = new Gtk.Label({ xalign:  1, label:_(settings.settings_schema.get_key(KEY).get_summary()),halign: Gtk.Align.START });
    let SettingSwitch0 = new Gtk.Switch({hexpand: false, active: settings.get_boolean(KEY), halign: Gtk.Align.START});
    let prefsSwitchBox = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL, margin: 0,hexpand:true});
        
    SettingSwitch0.connect("notify::active", Lang.bind(this, function(button) {
      settings.set_boolean(KEY, button.active);
      reloadExtension();
    }));

    settings.connect("changed::"+KEY, () => {
      SettingSwitch0.set_active(settings.get_boolean(KEY));
    });
   
    prefsSwitchBox.add(SettingSwitch0);
    sbox.attach(SettingLabel0,  posX,       posY, 1, 1);
    sbox.attach(prefsSwitchBox, posX+space, posY, 1, 1);
    
  },  

});

const PrefsWindowForAction_AnimationTweaksExtension = new GObject.Class({

  Name: 'PrefsWindowForAction_AnimationTweaksExtension',
  Extends: Gtk.Notebook,
    
  _init: function() {
  
    this.parent({});
          
    this.openingPrefs  = new PrefsWindowForOpening_AnimationTweaksExtension("open");
    this.closingPrefs  = new PrefsWindowForClosing_AnimationTweaksExtension("close");
    this.minimizePrefs = new PrefsWindowForMinimize_AnimationTweaksExtension("minimze");
    this.focusPrefs    = new PrefsWindowForFocus_AnimationTweaksExtension("focus");
    this.morePrefs     = new PrefsWindowForMore_AnimationTweaksExtension("more");

    this.prefsWindowOpening = new Gtk.ScrolledWindow({hexpand: true,shadow_type: Gtk.ShadowType.IN});
    this.prefsWindowOpening.add(this.openingPrefs);
    this.prefsWindowOpening.set_min_content_height(700);

    this.append_page(this.prefsWindowOpening, new Gtk.Label({ label: _("Open")                         }));
    this.append_page(this.closingPrefs,       new Gtk.Label({ label: _("Close")                        }));    
    this.append_page(this.minimizePrefs,      new Gtk.Label({ label: _("Minimize")+" / "+_("Unminimize")}));    
    this.append_page(this.focusPrefs,         new Gtk.Label({ label: _("Focus")   +" / "+_("Defocus")  }));    
    this.append_page(this.morePrefs,          new Gtk.Label({ label: _("Drag")                         }));

    this.child_set_property(this.prefsWindowOpening, "tab-expand", true);
    this.child_set_property(this.closingPrefs,       "tab-expand", true);
    this.child_set_property(this.minimizePrefs,      "tab-expand", true);
    this.child_set_property(this.focusPrefs,         "tab-expand", true);
    this.child_set_property(this.morePrefs,          "tab-expand", true);

    this.openingPrefs.displayPrefs();
    this.closingPrefs.displayPrefs();
    this.minimizePrefs.displayPrefs();
    this.focusPrefs.displayPrefs();
    this.morePrefs.displayPrefs();
        
  },

});

const PrefsWindowForApps_AnimationTweaksExtension = new GObject.Class({

  Name: 'PrefsWindowForApps_AnimationTweaksExtension',
  Extends: Gtk.Grid,

  _init: function() {  
  
    this.parent();
    
  },
 
  addApp: function()  {
  
    let dialog = new Gtk.Dialog({ title: _('Choose an application'),transient_for: this.get_toplevel(),use_header_bar: true,modal: true });
    dialog._appChooser = new Gtk.AppChooserWidget({ show_all: true });
    dialog.set_default_response(Gtk.ResponseType.OK);
    dialog.add_button(Gtk.STOCK_CANCEL, Gtk.ResponseType.CANCEL);
    let addButton = dialog.add_button(_("Add"), Gtk.ResponseType.OK);
    let hbox = new Gtk.Box({orientation: Gtk.Orientation.VERTICAL,margin: 5});
    hbox.pack_start(dialog._appChooser, true, true, 0);
    dialog.get_content_area().pack_start(hbox, true, true, 0);
    dialog.connect('response', Lang.bind(this, function(dialog, id) {
      if (id != Gtk.ResponseType.OK) {
        dialog.destroy();
        return;
      }

      let appInfo = dialog._appChooser.get_app_info();
      if (!appInfo) {
        return;
      }

      let appsList = settings.get_strv('application-list');
      let nameList = settings.get_strv('name-list');
      if (appsList.indexOf(appInfo.get_id())>=0) {
        dialog.destroy();
        return;
      }
      appsList.push(appInfo.get_id());
      nameList.push(appInfo.get_name());
      this.addDefaultEffectsAt(nameList.length-1);
      
      settings.set_strv('application-list', appsList);
      settings.set_strv('name-list', nameList);
      this._store.set(this._store.append(),[0, 2, 1],[appInfo, appInfo.get_icon(), appInfo.get_name()]);

      dialog.destroy();
    }));
    
    dialog.show_all();
    
  },
  
  addDefaultEffectsAt: function() {

    this.appNormalOpenPrefs.appProfile.addDefaultEffectForWindowAction();  
    this.appNormalClosePrefs.appProfile.addDefaultEffectForWindowAction();  
    this.appNormalMinimizePrefs.appProfile.addDefaultEffectForWindowAction();  
    this.appNormalUnminimizePrefs.appProfile.addDefaultEffectForWindowAction();   
    
    reloadApplicationProfiles();
    
  },
  
  applicationProfilesStateSwitch: function(KEY) {
  
    let settingSwitch = new Gtk.Switch({hexpand: false,vexpand:false,active: settings.get_boolean(KEY),halign:Gtk.Align.END});
    let box  = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL, margin: 0,hexpand:true});
     box.add(settingSwitch);

    settingSwitch.connect('notify::active', ()=> { 
      settings.set_boolean(KEY,settingSwitch.active); 
      (settings.get_boolean("reload-profiles-signal")) ? settings.set_boolean("reload-profiles-signal", false) : settings.set_boolean("reload-profiles-signal", true);
    });
    
    settings.connect("changed::"+KEY, () => {
      settingSwitch.set_active(settings.get_boolean(KEY));
    });

    this.attachLabel(KEY,0,this.profilesOptionTopGrid);
    this.profilesOptionTopGrid.attach(box, 2, 0, 1, 1);
     
  },
  
  appViewChange: function() {
    
    let appsList = settings.get_strv('application-list');
    let nameList = settings.get_strv('name-list');
    
    let [any, model, iter] = this.treeView.get_selection().get_selected();
    let index=-1;
    
    if(any) {
      let appInfo = this._store.get_value(iter, 0); 
      index=appsList.indexOf(appInfo.get_id());
    }
    
    if(index >= 0 ) {
      this.AppLabel.label = "<big><b>"+settings.get_strv('name-list')[index]+" - "+_("Window Preferences")+"</b></big>";
      let appInfo = this._store.get_value(iter, 0); 
      this.AppIcon.gicon = appInfo.get_icon();
      index++;
    }
    
    else {
      this.AppLabel.label = "<big><b>"+_("No Application Selected")+" - "+_("Window Preferences")+"</b></big>";
    }
    
    this.appNormalOpenPrefs.updateValues(index);
    this.appNormalClosePrefs.updateValues(index);
    this.appNormalMinimizePrefs.updateValues(index);
    this.appNormalUnminimizePrefs.updateValues(index);
   
  }, 
  
  attachLabel: function(KEY,pos,box) {

    let prefLabel = new Gtk.Label({xalign: 1, label: _(settings.settings_schema.get_key(KEY).get_summary()), halign: Gtk.Align.CENTER});
    box.attach(prefLabel,1,pos,1,1);
    
  },

  displayPrefs: function() {
  
    this.makeList();
    this.refreshList();
    this.showPrefs();
  
  },
  
  emptyLine: function(posY) {
  
    this.gridWin.attach(new Gtk.Label({ xalign: 1, label: "" ,halign: Gtk.Align.CENTER }) ,0  ,posY ,1  ,1);
    
  },
  
  heading: function(posY) {
  
    this.gridWin.attach(new Gtk.Label({ xalign: 1, label: _("Action") ,halign: Gtk.Align.CENTER })          ,0  ,posY ,1  ,1);
    this.gridWin.attach(new Gtk.Label({ xalign: 1, label: _("Effect"),halign: Gtk.Align.CENTER })           ,1  ,posY ,1  ,1);
    this.gridWin.attach(new Gtk.Label({ xalign: 1, label: _("Time [ in ms ]"),halign: Gtk.Align.CENTER })   ,3  ,posY ,1  ,1);
    this.gridWin.attach(new Gtk.Label({ xalign: 1, label: _("Status"),     halign: Gtk.Align.CENTER })      ,4  ,posY ,1  ,1);
    
  },

  makeList: function() {
  
    this._store = new Gtk.ListStore();
    this._store.set_column_types([Gio.AppInfo, GObject.TYPE_STRING, Gio.Icon]);
    this.treeView = new Gtk.TreeView({ model: this._store,hexpand: true,vexpand: true ,halign: Gtk.Align.START});

    let iconRenderer = new Gtk.CellRendererPixbuf;
    let nameRenderer = new Gtk.CellRendererText;
    let appColumn    = new Gtk.TreeViewColumn({expand: true, resizable:true,alignment: 0.5,sort_column_id: 1,title:_("Application List")});
    let listBox      = new Gtk.ScrolledWindow({hexpand: true,shadow_type: Gtk.ShadowType.IN});
    
    appColumn.pack_start(iconRenderer, false);
    appColumn.pack_start(nameRenderer, true);
    appColumn.add_attribute(iconRenderer, "gicon", 2);
    appColumn.add_attribute(nameRenderer, "text",  1);
    
    this.treeView.append_column(appColumn);
    appColumn.set_fixed_width(300);
    listBox.add(this.treeView);
    listBox.set_min_content_width(200);
    
    let addButton = new Gtk.Button({label: "     "+_("Add")+"    ", halign:Gtk.Align.START});
    addButton.connect('clicked', Lang.bind(this, this.addApp));

    let delButton = new Gtk.Button({label: " "+_("Remove")+" ", halign:Gtk.Align.END});
    delButton.connect('clicked', Lang.bind(this, this.removeApp));

    this.profilesOptionTopGrid = new Gtk.Grid({ column_spacing: 40, halign: Gtk.Align.CENTER, margin: 20, row_spacing: 20 ,border_width: 0});
    this.gridWin               = new Gtk.Grid({ column_spacing: 20, halign: Gtk.Align.CENTER, margin: 20, row_spacing: 20 ,border_width: 0});

    this.profilesOptionTopGrid.attach(addButton,0,0,1,1);
    this.profilesOptionTopGrid.attach(delButton,3,0,1,1);
    
    this.attach(listBox, 0,0,1,3);
    this.attach(this.profilesOptionTopGrid, 1,0,1,1);
    this.attach(this.gridWin, 1,1,1,1);
    
  },

  refreshList: function()  {
  
    this._store.clear();
    let appsList = settings.get_strv("application-list");
    let nameList = settings.get_strv("name-list");

    for (let i = 0; i < nameList.length; i++) {
      let appInfo = Gio.DesktopAppInfo.new(appsList[i]);
      if(Gio.DesktopAppInfo.new(appsList[i])==null){
        appsList.splice(i,1);
        nameList.splice(i,1);
        i--;
      }
      else {
        this._store.set(this._store.append(),[0, 2, 1],[appInfo, appInfo.get_icon(), nameList[i]]);
      }
    }
    
    settings.set_strv("application-list",appsList);
    settings.set_strv("name-list", nameList);
    
  },

  removeApp: function() {
  
    let [any, model, iter] = this.treeView.get_selection().get_selected();
    let appsList = settings.get_strv("application-list");
    let nameList = settings.get_strv("name-list");

    if (any) {
      let indx,appInfo = this._store.get_value(iter, 0); 
      appsList.splice((indx=appsList.indexOf(appInfo.get_id())),1);
      nameList.splice(indx,1);
      this.removeAppEffectsAt(indx);
      settings.set_strv("application-list",appsList);
      settings.set_strv("name-list", nameList);
      this._store.remove(iter);
    }

  },
  
  removeAppEffectsAt: function(index) {
 
    if(index >= 0 )  {
      index++;
    }
    
    this.appNormalOpenPrefs.appIndex--;
    this.appNormalClosePrefs.appIndex--;
    this.appNormalMinimizePrefs.appIndex--;
    this.appNormalUnminimizePrefs.appIndex--;
    
    this.appNormalOpenPrefs.appProfile.removeEffectForWindowAction(index);  
    this.appNormalClosePrefs.appProfile.removeEffectForWindowAction(index);  
    this.appNormalMinimizePrefs.appProfile.removeEffectForWindowAction(index);  
    this.appNormalUnminimizePrefs.appProfile.removeEffectForWindowAction(index); 
    
    reloadApplicationProfiles();
    
  },

  showPrefs: function() {
    
    let pos = 0;
    
    this.AppLabel = new Gtk.Label({ xalign:  1, use_markup: true, halign: Gtk.Align.CENTER });
    this.AppIcon = new Gtk.Image({ gicon:null, pixel_size: 96 });
    this.iconImageBox  = new Gtk.Box();
    this.iconImageBox.set_center_widget(this.AppIcon);
    
    this.AppLabel.label = "<big><b>"+_("No Application Selected")+" - "+_("Window Preferences")+"</b></big>";
    this.emptyLine(pos++);
    this.gridWin.attach(this.iconImageBox ,0,pos++,7,1); 
    this.gridWin.attach(this.AppLabel,0,pos++,7,1);    
    this.emptyLine(pos++);
    this.heading(pos++);
    this.applicationProfilesStateSwitch("use-application-profiles");
    this.appNormalOpenPrefs       =  new AnimationSettingsForItemProfile_AnimationTweaksExtension("window", "normal", "open",       this.gridWin, pos++, this);
    this.appNormalClosePrefs      =  new AnimationSettingsForItemProfile_AnimationTweaksExtension("window", "normal", "close",      this.gridWin, pos++, this);
    this.appNormalMinimizePrefs   =  new AnimationSettingsForItemProfile_AnimationTweaksExtension("window", "normal", "minimize",   this.gridWin, pos++, this);
    this.appNormalUnminimizePrefs =  new AnimationSettingsForItemProfile_AnimationTweaksExtension("window", "normal", "unminimize", this.gridWin, pos++, this); 
    
    this.treeView.connect("cursor-changed",()=>this.appViewChange());
    
  },

});

const PrefsWindowForClosing_AnimationTweaksExtension = new GObject.Class({

  Name: 'PrefsWindowForClosing_AnimationTweaksExtension',
  Extends: PrefsWindow_AnimationTweaksExtension,

  _init: function(action) {  
  
    this.parent(action);
    
  },

  displayPrefs: function() { 
    
    this.prefsWA("closing-effect",        0,  0,  this.switchBox0    );
    this.heading(1);
    let pos = 2;
    new AnimationSettingsForItem_AnimationTweaksExtension("window",             "normal",             "close", this, pos++,this);
    new AnimationSettingsForItem_AnimationTweaksExtension("window",             "dialog",             "close", this, pos++,this);
    new AnimationSettingsForItem_AnimationTweaksExtension("window",             "modaldialog",        "close", this, pos++,this);
    this.emptyLine(pos++);
    new AnimationSettingsForItem_AnimationTweaksExtension("notificationbanner", "notificationbanner", "close", this, pos++,this);
    new AnimationSettingsForItem_AnimationTweaksExtension("padosd",             "padosd",             "close", this, pos++,this);
    new AnimationSettingsForItem_AnimationTweaksExtension("other",              "toppanelpopupmenu",  "close", this, pos++,this);
    new AnimationSettingsForItem_AnimationTweaksExtension("other",              "desktoppopupmenu",   "close", this, pos++,this);
    
  },
  
});

const PrefsWindowForFocus_AnimationTweaksExtension = new GObject.Class({

  Name: 'PrefsWindowForFocus_AnimationTweaksExtension',
  Extends: PrefsWindow_AnimationTweaksExtension,

  _init: function(action) {  
  
    this.parent(action);
    
    this.switchBox2 = new Gtk.Grid({ column_spacing: 40, halign: Gtk.Align.CENTER, margin: 20,                 row_spacing: 20 ,border_width:0 });
    this.switchBox3 = new Gtk.Grid({ column_spacing: 40, halign: Gtk.Align.CENTER, margin: 20, margin_top: 0,  row_spacing: 20 ,border_width:0 });

    this.attach(this.switchBox2, 0, 20, 5, 1);
    this.attach(this.switchBox3, 0, 30, 5, 1);

    this.switchBox1.margin_top     = 0;
    this.switchBox1.row_spacing    = 20;
    this.switchBox1.column_spacing = 40;
    
  },

  displayPrefs: function() { 
    
    this.prefsWA("focussing-effect",   0, 0, this.switchBox0);
    this.heading(0, this.switchBox1);
   
    new AnimationSettingsForItem_AnimationTweaksExtension("window", "normal",      "focus",      this.switchBox1, 1,  this      );
    new AnimationSettingsForItem_AnimationTweaksExtension("window", "dialog",      "focus",      this.switchBox1, 2,  this      );
    new AnimationSettingsForItem_AnimationTweaksExtension("window", "modaldialog", "focus",      this.switchBox1, 3,  this      );    
    
    this.prefsWA("defocussing-effect",  0, 0, this.switchBox2);
    new AnimationSettingsForItem_AnimationTweaksExtension("window", "normal",      "defocus",    this.switchBox3, 0,  this      );
    new AnimationSettingsForItem_AnimationTweaksExtension("window", "dialog",      "defocus",    this.switchBox3, 1,  this      );
    new AnimationSettingsForItem_AnimationTweaksExtension("window", "modaldialog", "defocus",    this.switchBox3, 2,  this      );

  },
  
});

const PrefsWindowForMinimize_AnimationTweaksExtension = new GObject.Class({

  Name: 'PrefsWindowForMinimize_AnimationTweaksExtension',
  Extends: PrefsWindow_AnimationTweaksExtension,

  _init: function(action) {  
  
    this.parent(action);
    
    this.switchBox2 = new Gtk.Grid({ column_spacing: 40, halign: Gtk.Align.CENTER, margin: 20,                 row_spacing: 20 ,border_width:0 });
    this.switchBox3 = new Gtk.Grid({ column_spacing: 40, halign: Gtk.Align.CENTER, margin: 20, margin_top: 0,  row_spacing: 20 ,border_width:0 });

    this.attach(this.switchBox2, 0, 20, 5, 1);
    this.attach(this.switchBox3, 0, 30, 5, 1);
                  
    this.switchBox1.margin_top     = 0;
    this.switchBox1.row_spacing    = 20;
    this.switchBox1.column_spacing = 40;
  },

  displayPrefs: function() { 
    
    this.prefsWA("minimizing-effect",   0, 0, this.switchBox0);
    this.heading(0, this.switchBox1);
    new AnimationSettingsForItem_AnimationTweaksExtension("window", "normal",      "minimize",   this.switchBox1, 1,  this      );
    new AnimationSettingsForItem_AnimationTweaksExtension("window", "dialog",      "minimize",   this.switchBox1, 2,  this      ); 
    
    this.prefsWA("unminimizing-effect", 0, 0, this.switchBox2);
    new AnimationSettingsForItem_AnimationTweaksExtension("window", "normal",      "unminimize", this.switchBox3, 0,  this      );
    new AnimationSettingsForItem_AnimationTweaksExtension("window", "dialog",      "unminimize", this.switchBox3, 1,  this      );

  },
  
});

const PrefsWindowForMore_AnimationTweaksExtension = new GObject.Class({

  Name: 'PrefsWindowForMore_AnimationTweaksExtension',
  Extends: PrefsWindow_AnimationTweaksExtension,

  _init: function(action) {  
  
    this.parent(action);
                      
    this.switchBox1.margin_top     = 0;
    this.switchBox1.row_spacing    = 20;
    this.switchBox1.column_spacing = 40;
  },

  displayPrefs: function() { 
    
    this.prefsWA("moving-effect",   0, 0, this.switchBox0);
    this.heading(0, this.switchBox1);
    new AnimationSettingsForItem_AnimationTweaksExtension("window", "normal",      "movestart",  this.switchBox1, 1, this, true);
    new AnimationSettingsForItem_AnimationTweaksExtension("window", "dialog",      "movestart",  this.switchBox1, 2, this, true);   
    new AnimationSettingsForItem_AnimationTweaksExtension("window", "modaldialog", "movestart",  this.switchBox1, 3, this, true);    

  },
  
});

const PrefsWindowForOpening_AnimationTweaksExtension = new GObject.Class({

  Name: 'PrefsWindowForOpening_AnimationTweaksExtension',
  Extends: PrefsWindow_AnimationTweaksExtension,

  _init: function(action) {  
  
    this.parent(action);
  },

  displayPrefs: function() { 
    
    let pos=0;
    
    this.prefsWA("opening-effect", 0, pos++, this.switchBox0); 
    this.heading(pos++);
    new AnimationSettingsForItem_AnimationTweaksExtension("window",             "normal",             "open", this, pos++, this);
    new AnimationSettingsForItem_AnimationTweaksExtension("window",             "dialog",             "open", this, pos++, this);
    new AnimationSettingsForItem_AnimationTweaksExtension("window",             "modaldialog",        "open", this, pos++, this);
    new AnimationSettingsForItem_AnimationTweaksExtension("other",              "dropdownmenu",       "open", this, pos++, this);
    new AnimationSettingsForItem_AnimationTweaksExtension("other",              "popupmenu",          "open", this, pos++, this);    
    new AnimationSettingsForItem_AnimationTweaksExtension("other",              "combo",              "open", this, pos++, this);    
    new AnimationSettingsForItem_AnimationTweaksExtension("other",              "tooltip",            "open", this, pos++, this);    
    new AnimationSettingsForItem_AnimationTweaksExtension("other",              "splashscreen",       "open", this, pos++, this);    
    new AnimationSettingsForItem_AnimationTweaksExtension("other",              "overrideother",      "open", this, pos++, this);   
    this.emptyLine(pos++); 
    new AnimationSettingsForItem_AnimationTweaksExtension("notificationbanner", "notificationbanner", "open", this, pos++, this); 
    new AnimationSettingsForItem_AnimationTweaksExtension("padosd",             "padosd",             "open", this, pos++, this);   
    new AnimationSettingsForItem_AnimationTweaksExtension("other",              "toppanelpopupmenu",  "open", this, pos++, this);       
    new AnimationSettingsForItem_AnimationTweaksExtension("other",              "desktoppopupmenu",   "open", this, pos++, this);       
    
  },

}); 

const PrefsWindowForProfiles_AnimationTweaksExtension = new GObject.Class({

  Name: 'PrefsWindowForProfiles_AnimationTweaksExtension',
  Extends: Gtk.Notebook,
    
  _init: function() {
  
    this.parent({});
          
    this.appProfilesPrefs       = new PrefsWindowForApps_AnimationTweaksExtension();
    this.extensionProfilesPrefs = new PrefsWindowForExtensionProfiles_AnimationTweaksExtension();

    this.append_page(this.appProfilesPrefs,       new Gtk.Label({ label: _("Application Profiles")}) );
    this.append_page(this.extensionProfilesPrefs, new Gtk.Label({ label: _("Extension Profiles")})   );

    this.child_set_property(this.appProfilesPrefs,       "tab-expand", true);
    this.child_set_property(this.extensionProfilesPrefs, "tab-expand", true);

    this.appProfilesPrefs.displayPrefs();
    this.extensionProfilesPrefs.displayPrefs();
    
  },

});

const PrefsWindowForExtensionProfiles_AnimationTweaksExtension = new GObject.Class({

  Name: 'PrefsWindowForExtensionProfiles_AnimationTweaksExtension',
  Extends: PrefsWindow_AnimationTweaksExtension,

  _init: function() {  
  
    this.parent();
    this.setPath();   
   
  },
  
  addImportExportPrefs: function() {

    let exportExtensionProfilesButton  = new Gtk.Button({label: _("Export Profiles"),halign:Gtk.Align.START});  
    let importExtensionProfilesButton  = new Gtk.Button({label: _("Import Profiles"),halign:Gtk.Align.END});
    
    exportExtensionProfilesButton.connect('clicked', ()=>  this.fileManagementDialogWindow(1));
    importExtensionProfilesButton.connect('clicked',  ()=> this.fileManagementDialogWindow(0));

    this.existingProfiles = this.listProfiles(this.PROFILE_PATH+PROFILE_FILE_NAME);  
    this.prefCombo("profile-name", 0, 0, this.existingProfiles, this.existingProfiles);

    this.attach(exportExtensionProfilesButton,0,1,1,1);
    this.attach(importExtensionProfilesButton,1,1,2,1);
    
  },
  
  applyProfile: function(profileName) {
  
    let profileClass = new Extension.imports.profiles.animationTweaksExtensionProfiles["AnimationTweaksExtensionProfile"+profileName]();
    
    settings.set_string("profile-name", profileClass.animationTweaksExtensionProfileName);
  
    settings.set_boolean("opening-effect",      profileClass.openingEffectEnabled);
    settings.set_boolean("closing-effect",      profileClass.closingingEffectEnabled);
    settings.set_boolean("minimizing-effect",   profileClass.minimizingEffectEnabled);
    settings.set_boolean("unminimizing-effect", profileClass.unMinimizingEffectEnabled);
    settings.set_boolean("moving-effect",       profileClass.movingEffectEnabled);
    settings.set_boolean("focussing-effect",    profileClass.focussingEffectEnabled);
    settings.set_boolean("defocussing-effect",  profileClass.defocussingEffectEnabled);
  
    settings.set_boolean("use-application-profiles", profileClass.useApplicationProfiles);
    settings.set_strv("name-list",                   profileClass.nameList);
    settings.set_strv("application-list",            profileClass.appList);
    
    settings.set_strv("normal-open",       profileClass.normalWindowopenProfileRaw); 
    settings.set_strv("normal-close",      profileClass.normalWindowcloseProfileRaw);
    settings.set_strv("normal-minimize",   profileClass.normalWindowminimizeProfileRaw);
    settings.set_strv("normal-unminimize", profileClass.normalWindowunminimizeProfileRaw);    
    settings.set_strv("normal-movestart",  profileClass.normalWindowmovestartProfileRaw);   
    settings.set_strv("normal-focus",      profileClass.normalWindowfocusProfileRaw);    
    settings.set_strv("normal-defocus",    profileClass.normalWindowdefocusProfileRaw);    
     
    settings.set_strv("dialog-open",       profileClass.dialogWindowopenProfileRaw);
    settings.set_strv("dialog-close",      profileClass.dialogWindowcloseProfileRaw);
    settings.set_strv("dialog-minimize",   profileClass.dialogWindowminimizeProfileRaw);
    settings.set_strv("dialog-unminimize", profileClass.dialogWindowunminimizeProfileRaw);  
    settings.set_strv("dialog-movestart",  profileClass.dialogWindowmovestartProfileRaw);
    settings.set_strv("dialog-focus",      profileClass.dialogWindowfocusProfileRaw);    
    settings.set_strv("dialog-defocus",    profileClass.dialogWindowdefocusProfileRaw);    

    settings.set_strv("modaldialog-open",       profileClass.modaldialogWindowopenProfileRaw);
    settings.set_strv("modaldialog-close",      profileClass.modaldialogWindowcloseProfileRaw);
    settings.set_strv("modaldialog-minimize",   profileClass.modaldialogWindowminimizeProfileRaw);
    settings.set_strv("modaldialog-unminimize", profileClass.modaldialogWindowunminimizeProfileRaw);  
    settings.set_strv("modaldialog-movestart",  profileClass.modaldialogWindowmovestartProfileRaw);
    settings.set_strv("modaldialog-focus",      profileClass.modaldialogWindowfocusProfileRaw);    
    settings.set_strv("modaldialog-defocus",    profileClass.modaldialogWindowdefocusProfileRaw);    
    
    settings.set_strv("dropdownmenu-open",  profileClass.dropdownmenuWindowopenProfile);
    settings.set_strv("popupmenu-open",     profileClass.popupmenuWindowopenProfile);
    settings.set_strv("combo-open",         profileClass.comboWindowopenProfile);
    settings.set_strv("splashscreen-open",  profileClass.splashscreenWindowopenProfile);
    settings.set_strv("tooltip-open",       profileClass.tooltipWindowopenProfile);
    settings.set_strv("overrideother-open", profileClass.overrideotherWindowopenProfile);    

    settings.set_strv("notificationbanner-open",  profileClass.notificationbannerWindowopenProfile);
    settings.set_strv("notificationbanner-close", profileClass.notificationbannerWindowcloseProfile);
    settings.set_enum("notificationbanner-pos",   profileClass.notificationBannerAlignment);  
    
    settings.set_strv("padosd-open",  profileClass.padosdWindowopenProfile);
    settings.set_strv("padosd-close", profileClass.padosdWindowcloseProfile); 
    
    settings.set_strv("toppanelpopupmenu-open",  profileClass.toppanelpopupmenuWindowopenProfile);
    settings.set_strv("toppanelpopupmenu-close", profileClass.toppanelpopupmenuWindowcloseProfile);     
      
    settings.set_strv("desktoppopupmenu-open",  profileClass.desktoppopupmenuWindowopenProfile);
    settings.set_strv("desktoppopupmenu-close", profileClass.desktoppopupmenuWindowcloseProfile);     

      
    settings.set_boolean("wayland",         profileClass.waylandWorkaroundEnabled);
    settings.set_int("padosd-hide-timeout", profileClass.padOSDHideTime);    
    
  },
  
  displayPrefs: function() {
  
    this.addImportExportPrefs();     
    
  },
  
  fileManagementDialogWindow: function(action) {
  
    let fileFormats  = new Gtk.FileFilter();        
    let dialog       = new Gtk.FileChooserDialog({ title: (( action == 0 ) ? _("Import") : _("Export"))+_(" Animation Tweaks Profile") ,action: action, filter: fileFormats, do_overwrite_confirmation: true, transient_for: this.get_toplevel(),use_header_bar: true,modal: true });
    let exportButton = dialog.add_button(( action == 0 ) ? _("Import") : _("Export"), Gtk.ResponseType.OK);
        
    fileFormats.add_pattern("*.js");    
    dialog.add_button(Gtk.STOCK_CANCEL, Gtk.ResponseType.CANCEL);
    ( action != 0 ) ? dialog.set_current_name (PROFILE_FILE_NAME): null;
    dialog.show_all();
    
    dialog.connect('response', Lang.bind(this, function(dialog, id) {
    
      if(id == Gtk.ResponseType.OK) {
        ( action == 0 ) ? this.importProfiles(dialog.get_filename()) : GLib.file_set_contents( dialog.get_filename(), String( GLib.file_get_contents(this.PROFILE_PATH+PROFILE_FILE_NAME) [1]) );      
      }
      
      dialog.destroy();
      return;
        
    }));
    
  },
  
  importProfiles: function(location) {
  
    let importedFileData = String( GLib.file_get_contents(location) [1]);
    let profileFileData  = String( GLib.file_get_contents(this.PROFILE_PATH+PROFILE_FILE_NAME) [1]);
    let profilesClassList = this.listProfiles(this.PROFILE_PATH+PROFILE_FILE_NAME);  
    let importedClassList = this.listProfiles(location);  
    
    profileFileData += this.onlyKeepProfiles(importedFileData, importedClassList, profilesClassList);    
    GLib.file_set_contents(this.PROFILE_PATH+PROFILE_FILE_NAME, profileFileData);
  
  },
  
  listProfiles: function(fileName) {
  
    let profileFileData = String( GLib.file_get_contents(fileName)[1]);
    let profilesList = []; 
    let indexOfVar = profileFileData.indexOf("var AnimationTweaksExtensionProfile");
    
    while(indexOfVar != -1) {
    
      profilesList.push(profileFileData.substring(indexOfVar+35, profileFileData.indexOf("=", indexOfVar) ));
      indexOfVar = profileFileData.indexOf("var AnimationTweaksExtensionProfile", indexOfVar+1);
      
    } 
    
    return profilesList;
  
  }, 
  
  loadExtensionProfiles: function() {
  
    this.profileName = settings.get_string("profile-name");
    this.version     = settings.get_int("current-version");
  
    this.openingEffectEnabled       = settings.get_boolean("opening-effect");
    this.closingingEffectEnabled    = settings.get_boolean("closing-effect");
    this.minimizingEffectEnabled    = settings.get_boolean("minimizing-effect");
    this.unMinimizingEffectEnabled  = settings.get_boolean("unminimizing-effect");
    this.movingEffectEnabled        = settings.get_boolean("moving-effect");
    this.focussingEffectEnabled     = settings.get_boolean("focussing-effect");
    this.defocussingEffectEnabled   = settings.get_boolean("defocussing-effect");
  
    this.useApplicationProfiles = settings.get_boolean("use-application-profiles");
    this.nameList = settings.get_strv("name-list");
    this.appList  = settings.get_strv("application-list");
    
    this.normalWindowopenProfileRaw       = settings.get_strv("normal-open"); 
    this.normalWindowcloseProfileRaw      = settings.get_strv("normal-close");
    this.normalWindowminimizeProfileRaw   = settings.get_strv("normal-minimize");
    this.normalWindowunminimizeProfileRaw = settings.get_strv("normal-unminimize");    
    this.normalWindowmovestartProfileRaw  = settings.get_strv("normal-movestart");   
    this.normalWindowfocusProfileRaw      = settings.get_strv("normal-focus");    
    this.normalWindowdefocusProfileRaw    = settings.get_strv("normal-defocus");    
     
    this.dialogWindowopenProfileRaw       = settings.get_strv("dialog-open");
    this.dialogWindowcloseProfileRaw      = settings.get_strv("dialog-close");
    this.dialogWindowminimizeProfileRaw   = settings.get_strv("dialog-minimize");
    this.dialogWindowunminimizeProfileRaw = settings.get_strv("dialog-unminimize");  
    this.dialogWindowmovestartProfileRaw  = settings.get_strv("dialog-movestart");
    this.dialogWindowfocusProfileRaw      = settings.get_strv("dialog-focus");    
    this.dialogWindowdefocusProfileRaw    = settings.get_strv("dialog-defocus");    

    this.modaldialogWindowopenProfileRaw       = settings.get_strv("modaldialog-open");
    this.modaldialogWindowcloseProfileRaw      = settings.get_strv("modaldialog-close");
    this.modaldialogWindowminimizeProfileRaw   = settings.get_strv("modaldialog-minimize");
    this.modaldialogWindowunminimizeProfileRaw = settings.get_strv("modaldialog-unminimize");  
    this.modaldialogWindowmovestartProfileRaw  = settings.get_strv("modaldialog-movestart");
    this.modaldialogWindowfocusProfileRaw      = settings.get_strv("modaldialog-focus");    
    this.modaldialogWindowdefocusProfileRaw    = settings.get_strv("modaldialog-defocus");    
    
    this.dropdownmenuWindowopenProfile  = settings.get_strv("dropdownmenu-open");
    this.popupmenuWindowopenProfile     = settings.get_strv("popupmenu-open");
    this.comboWindowopenProfile         = settings.get_strv("combo-open");
    this.splashscreenWindowopenProfile  = settings.get_strv("splashscreen-open");
    this.tooltipWindowopenProfile       = settings.get_strv("tooltip-open");
    this.overrideotherWindowopenProfile = settings.get_strv("overrideother-open");    

    this.notificationbannerWindowopenProfile  = settings.get_strv("notificationbanner-open");
    this.notificationbannerWindowcloseProfile = settings.get_strv("notificationbanner-close");
    this.notificationBannerAlignment          = settings.get_enum("notificationbanner-pos");  
    
    this.padosdWindowopenProfile  = settings.get_strv("padosd-open");
    this.padosdWindowcloseProfile = settings.get_strv("padosd-close"); 
    
    this.toppanelpopupmenuWindowopenProfile  = settings.get_strv("toppanelpopupmenu-open"); 
    this.toppanelpopupmenuWindowcloseProfile = settings.get_strv("toppanelpopupmenu-close"); 
    
    this.desktoppopupmenuWindowopenProfile  = settings.get_strv("desktoppopupmenu-open"); 
    this.desktoppopupmenuWindowcloseProfile = settings.get_strv("desktoppopupmenu-close");        
      
    this.waylandWorkaroundEnabled = settings.get_boolean("wayland");
    this.padOSDHideTime           = settings.get_int("padosd-hide-timeout");

  },
   
  onlyKeepProfiles: function(fileData, importedClassList, profilesClassList) {
  
    let onlyProfileData = "";
    let thisprofileData = "";
    
    for(let i=0;i<importedClassList.length;i++) {
      
      let newName = this.solveNameConflict(importedClassList[i],profilesClassList);
  
      let indexOfVar = fileData.indexOf("var AnimationTweaksExtensionProfile"+importedClassList[i]+"=class AnimationTweaksExtensionProfile"+importedClassList[i]+"{");
      let indexOfEndOfProfile = fileData.indexOf("}}//EndOfAnimationTweaksExtensionProfile"+importedClassList[i], indexOfVar);
      
      if(indexOfVar != -1 && indexOfEndOfProfile != -1) {
        thisprofileData = "\n"+fileData.substring(indexOfVar,indexOfEndOfProfile+40+importedClassList[i].length);    
        thisprofileData = thisprofileData.replace("var AnimationTweaksExtensionProfile"+importedClassList[i]+"=class AnimationTweaksExtensionProfile"+importedClassList[i]+"{", "var AnimationTweaksExtensionProfile"+newName+"=class AnimationTweaksExtensionProfile"+newName+"{");
        thisprofileData = thisprofileData.replace("this.animationTweaksExtensionProfileName=\""+importedClassList[i]+"\"","this.animationTweaksExtensionProfileName=\""+newName+"\"");
        thisprofileData = thisprofileData.replace("}}//EndOfAnimationTweaksExtensionProfile"+importedClassList[i],"}}//EndOfAnimationTweaksExtensionProfile"+newName);
        onlyProfileData += thisprofileData; 
      }
      
      profilesClassList.push(newName);
     
    }
    
    return onlyProfileData;
    
  },
  
  prefCombo: function(KEY, posX, posY, options, items) {
  
    let settingLabel = new Gtk.Label({xalign: 1, label: _(settings.settings_schema.get_key(KEY).get_summary()), halign: Gtk.Align.START});  
    let SettingCombo = new Gtk.ComboBoxText();
    let saveExtensionProfilesButton   = new Gtk.Button({label: _("Save"),    halign:Gtk.Align.START});
    
    saveExtensionProfilesButton.connect('clicked',    ()=> this.saveCurrentProfile());
    
    for (let i = 0; i < options.length; i++) {
      SettingCombo.append(options[i],  items[i]);
    }
    SettingCombo.set_active(options.indexOf(settings.get_string(KEY)));
    SettingCombo.connect('changed', Lang.bind(this, function(widget) {
      settings.set_string(KEY, options[widget.get_active()]);
      this.applyProfile(options[widget.get_active()]);
      reloadApplicationProfiles();
    }));
    
    this.attach(settingLabel,                posX,   posY, 1, 1);
    this.attach(SettingCombo,                posX+1, posY, 1, 1);
    this.attach(saveExtensionProfilesButton, posX+2, posY, 1, 1);
      
  },
  
  saveCurrentProfile: function() {
  
    this.loadExtensionProfiles();
    let oldProfileFileData = String( GLib.file_get_contents(this.PROFILE_PATH+PROFILE_FILE_NAME) [1]);
     
    let newProfileData = "";
    
    newProfileData += "var AnimationTweaksExtensionProfile"+this.profileName+"=class AnimationTweaksExtensionProfile"+this.profileName+"{\n";
    newProfileData += "constructor(){\n";     
    newProfileData += "this.animationTweaksExtensionProfileName=\""+this.profileName+"\";\n";
    newProfileData += "this.firstUse=true;\n";
    newProfileData += "this.version="+this.version+";\n";
    newProfileData += "this.openingEffectEnabled="+this.openingEffectEnabled+";\n";
    newProfileData += "this.closingingEffectEnabled="+this.closingingEffectEnabled+";\n";
    newProfileData += "this.minimizingEffectEnabled="+this.minimizingEffectEnabled+";\n";
    newProfileData += "this.unMinimizingEffectEnabled="+this.unMinimizingEffectEnabled+";\n";
    newProfileData += "this.movingEffectEnabled="+this.movingEffectEnabled+";\n";
    newProfileData += "this.focussingEffectEnabled="+this.focussingEffectEnabled+";\n";
    newProfileData += "this.defocussingEffectEnabled="+this.defocussingEffectEnabled+";\n";
  
    newProfileData += "this.useApplicationProfiles="+this.useApplicationProfiles+";\n";
    newProfileData += "this.nameList="+this.stringifyParameters(this.nameList);
    newProfileData += "this.appList="+this.stringifyParameters(this.appList);
    
    newProfileData += "this.normalWindowopenProfileRaw="+this.stringifyParameters(this.normalWindowopenProfileRaw);
    newProfileData += "this.normalWindowcloseProfileRaw="+this.stringifyParameters(this.normalWindowcloseProfileRaw);
    newProfileData += "this.normalWindowminimizeProfileRaw="+this.stringifyParameters(this.normalWindowminimizeProfileRaw);
    newProfileData += "this.normalWindowunminimizeProfileRaw="+this.stringifyParameters(this.normalWindowunminimizeProfileRaw);
    newProfileData += "this.normalWindowmovestartProfileRaw="+this.stringifyParameters(this.normalWindowmovestartProfileRaw);
    newProfileData += "this.normalWindowfocusProfileRaw="+this.stringifyParameters(this.normalWindowfocusProfileRaw);
    newProfileData += "this.normalWindowdefocusProfileRaw="+this.stringifyParameters(this.normalWindowdefocusProfileRaw);
     
    newProfileData += "this.dialogWindowopenProfileRaw="+this.stringifyParameters(this.dialogWindowopenProfileRaw);
    newProfileData += "this.dialogWindowcloseProfileRaw="+this.stringifyParameters(this.dialogWindowcloseProfileRaw);
    newProfileData += "this.dialogWindowminimizeProfileRaw="+this.stringifyParameters(this.dialogWindowminimizeProfileRaw);
    newProfileData += "this.dialogWindowunminimizeProfileRaw="+this.stringifyParameters(this.dialogWindowunminimizeProfileRaw);
    newProfileData += "this.dialogWindowmovestartProfileRaw="+this.stringifyParameters(this.dialogWindowmovestartProfileRaw);
    newProfileData += "this.dialogWindowfocusProfileRaw="+this.stringifyParameters(this.dialogWindowfocusProfileRaw);
    newProfileData += "this.dialogWindowdefocusProfileRaw="+this.stringifyParameters(this.dialogWindowdefocusProfileRaw);

    newProfileData += "this.modaldialogWindowopenProfileRaw="+this.stringifyParameters(this.modaldialogWindowopenProfileRaw);
    newProfileData += "this.modaldialogWindowcloseProfileRaw="+this.stringifyParameters(this.modaldialogWindowcloseProfileRaw);
    newProfileData += "this.modaldialogWindowminimizeProfileRaw="+this.stringifyParameters(this.modaldialogWindowminimizeProfileRaw);
    newProfileData += "this.modaldialogWindowunminimizeProfileRaw="+this.stringifyParameters(this.modaldialogWindowunminimizeProfileRaw);
    newProfileData += "this.modaldialogWindowmovestartProfileRaw="+this.stringifyParameters(this.modaldialogWindowmovestartProfileRaw);
    newProfileData += "this.modaldialogWindowfocusProfileRaw="+this.stringifyParameters(this.modaldialogWindowfocusProfileRaw);
    newProfileData += "this.modaldialogWindowdefocusProfileRaw="+this.stringifyParameters(this.modaldialogWindowdefocusProfileRaw);
    
    newProfileData += "this.dropdownmenuWindowopenProfile="+this.stringifyParameters(this.dropdownmenuWindowopenProfile);
    newProfileData += "this.popupmenuWindowopenProfile="+this.stringifyParameters(this.popupmenuWindowopenProfile);
    newProfileData += "this.comboWindowopenProfile="+this.stringifyParameters(this.comboWindowopenProfile);
    newProfileData += "this.splashscreenWindowopenProfile="+this.stringifyParameters(this.splashscreenWindowopenProfile);
    newProfileData += "this.tooltipWindowopenProfile="+this.stringifyParameters(this.tooltipWindowopenProfile);
    newProfileData += "this.overrideotherWindowopenProfile="+this.stringifyParameters(this.overrideotherWindowopenProfile);

    newProfileData += "this.notificationbannerWindowopenProfile="+this.stringifyParameters(this.notificationbannerWindowopenProfile);
    newProfileData += "this.notificationbannerWindowcloseProfile="+this.stringifyParameters(this.notificationbannerWindowcloseProfile);
    newProfileData += "this.notificationBannerAlignment=\""+this.notificationBannerAlignment+"\"\n";
    
    newProfileData += "this.padosdWindowopenProfile="+this.stringifyParameters(this.padosdWindowopenProfile);
    newProfileData += "this.padosdWindowcloseProfile="+this.stringifyParameters(this.padosdWindowcloseProfile);

    newProfileData += "this.toppanelpopupmenuWindowopenProfile="+this.stringifyParameters(this.toppanelpopupmenuWindowopenProfile);
    newProfileData += "this.toppanelpopupmenuWindowcloseProfile="+this.stringifyParameters(this.toppanelpopupmenuWindowcloseProfile);

    newProfileData += "this.desktoppopupmenuWindowopenProfile="+this.stringifyParameters(this.desktoppopupmenuWindowopenProfile);
    newProfileData += "this.desktoppopupmenuWindowcloseProfile="+this.stringifyParameters(this.desktoppopupmenuWindowcloseProfile);
      
    newProfileData += "this.waylandWorkaroundEnabled="+this.waylandWorkaroundEnabled+";\n";
    newProfileData += "this.padOSDHideTime= "+this.padOSDHideTime+";\n";    
    newProfileData += "}}//EndOfAnimationTweaksExtensionProfile"+this.profileName; 
    
    let indexOfVar = oldProfileFileData.indexOf("var AnimationTweaksExtensionProfile"+this.profileName+"=class AnimationTweaksExtensionProfile"+this.profileName+"{");
    let indexOfEndOfProfile = oldProfileFileData.indexOf("}}//EndOfAnimationTweaksExtensionProfile"+this.profileName, indexOfVar);
    oldProfileFileData = oldProfileFileData.replace(oldProfileFileData.substring(indexOfVar,indexOfEndOfProfile+40+this.profileName.length),newProfileData);
    GLib.file_set_contents(this.PROFILE_PATH+PROFILE_FILE_NAME, oldProfileFileData);
    
  }, 
  
  setPath: function() {
 
    this.PROFILE_PATH = "/home/"+GLib.spawn_command_line_sync("whoami")[1]+"/.config/gnome-shell-extension-animation-tweaks@Selenium-H";
    this.PROFILE_PATH = this.PROFILE_PATH.replace("\n","");
    if(GLib.spawn_command_line_sync("ls "+this.PROFILE_PATH)[1] != "profiles\n") {
      GLib.spawn_command_line_sync("mkdir "+this.PROFILE_PATH);
      GLib.spawn_command_line_sync("cp -r "+Extension.path+"/profiles/ "+this.PROFILE_PATH);
    }
 
    Extension.imports.searchPath = [this.PROFILE_PATH];
    this.PROFILE_PATH += "/profiles/";
    return;

  },
  
  solveNameConflict: function(profileName, profilesClassList) {

    while(profilesClassList.indexOf(profileName) >= 0) {
      profileName += "_1";
    }
    
    return profileName;
  
  },
  
  stringifyParameters: function(stringArray) {
  
    let stringifiedArray = "[";
    
    if(stringArray.length > 0) {
      stringifiedArray += "\""+stringArray[0]+"\"";
      for(let i=1;i<stringArray.length;i++) {
        stringifiedArray += ",\""+stringArray[i]+"\""; 
      }
    }
   
    stringifiedArray += "];\n";

    return stringifiedArray; 
  
  },

});

const PrefsWindowForTweaks_AnimationTweaksExtension = new GObject.Class({

  Name: 'PrefsWindowForTweaks_AnimationTweaksExtension',
  Extends: PrefsWindow_AnimationTweaksExtension,

  _init: function() {  
  
    this.parent();
    
  },  
  
  displayPrefs: function() {
  
    this.margin_top     = 20;
  
    let pos=0;
    this.prefsWA("wayland",                  0, pos++, this, 7);
    this.prefInt("padosd-hide-timeout",      0, pos++,       7);
    this.prefCombo("notificationbanner-pos", 0, pos++,
                   ["auto", "left", "center", "right"],
                   [_("Autodetect"), _("Left"), _("Center"), _("Right")], 7);
    this.prefStr("disable-shortcut", 0, pos++,
                 ['<Alt>', '<Ctrl>', '<Shift>', '<Super>'],
                 [_('Alt Key'), _('Ctrl Key'), _('Shift Key'), _('Super Key')], 7);
    
  },
  
  prefInt: function(KEY,posX,posY,space) {

    let settingLabel = new Gtk.Label({xalign: 1, label: _(settings.settings_schema.get_key(KEY).get_summary()), halign: Gtk.Align.START});  
    let timeSetting = Gtk.SpinButton.new_with_range(250,10000, 1);
    timeSetting.set_value(settings.get_int(KEY));
    timeSetting.connect('notify::value', function(spin) {
      settings.set_int(KEY,spin.get_value_as_int());
    });

    this.attach(settingLabel, posX,       posY, space, 1);
    this.attach(timeSetting,  posX+space, posY, 1,     1);
    
  },

  prefCombo: function(KEY, posX, posY, options, items,space) {
  
    let settingLabel = new Gtk.Label({xalign: 1, label: _(settings.settings_schema.get_key(KEY).get_summary()), halign: Gtk.Align.START});  
    let SettingCombo = new Gtk.ComboBoxText();
    for (let i = 0; i < options.length; i++) {
      SettingCombo.append(options[i],  items[i]);
    }
    SettingCombo.set_active(options.indexOf(settings.get_string(KEY)));
    SettingCombo.connect('changed', Lang.bind(this, function(widget) {
      settings.set_string(KEY, options[widget.get_active()]);
      reloadApplicationProfiles();
    }));
    
    this.attach(settingLabel, posX,       posY, space, 1);
    this.attach(SettingCombo, posX+space, posY, 1,     1);
    
  },
  
  prefStr: function(KEY, posX, posY, options, items,space) {
  
    let SettingCombo  = new Gtk.ComboBoxText();
    let settingLabel = new Gtk.Label({xalign: 1, label: _(settings.settings_schema.get_key(KEY).get_summary()), halign: Gtk.Align.START});  
    
    for (let i=0;i<options.length;i++) {
      SettingCombo.append(options[i],   items[i]);
    }
    
    let keyVal=settings.get_strv(KEY);
    let strSetting = new Gtk.Entry({text:keyVal[0].substring(1+keyVal[0].indexOf('>'))});
    let box = new Gtk.Box({halign:Gtk.Align.END});
    
    strSetting.set_width_chars(1);
    SettingCombo.set_active(options.indexOf(keyVal[0].substring(0,1+keyVal[0].indexOf('>'))));
    SettingCombo.connect('changed', Lang.bind (this, function(widget) {  
      keyVal.pop(); 
      keyVal.push(options[widget.get_active()]+strSetting.text);
      settings.set_strv(KEY,keyVal);
    }));
    
    strSetting.connect('changed'  , Lang.bind (this, function()  {  
      keyVal.pop(); 
      keyVal.push(options[SettingCombo.get_active()]+strSetting.text);
      settings.set_strv(KEY,keyVal);
    }));
    
    box.add(SettingCombo);
    box.add(new Gtk.Label({label: "  +  "}));
    box.add(strSetting);
    
    this.attach(settingLabel, posX,       posY,  space, 1);
    this.attach(box,          posX+space, posY,  1,     1);
    
  },
  
});


