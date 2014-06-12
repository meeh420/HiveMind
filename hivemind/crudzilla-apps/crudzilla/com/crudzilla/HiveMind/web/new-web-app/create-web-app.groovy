import org.apache.commons.io.FileUtils;
import java.io.File;

import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.apache.commons.dbutils.QueryRunner;
import org.apache.commons.dbutils.ResultSetHandler;
import com.crudzilla.platform.Crudzilla;
import com.crudzilla.platform.util.CrudzillaUtil;

def deWindowize(String path){
   String normalizePath = path.replace("\\","/");   
  
   //remove windows drive letter part of the path
   if(normalizePath.indexOf(':') != -1)
      normalizePath = normalizePath.substring(normalizePath.indexOf(':')+1);  
  
   return normalizePath;
}



def logTS(label){
  arguments.put("curTS",new java.util.Date().getTime());
  crud.logger().info("@"+label+" TS Diff "+(arguments.get("curTS") - arguments.get("prevTS")));
  arguments.put("prevTS",arguments.get("curTS")); 
}

def attachTransaction(c){
  Object transaction  = httpRequest.getSession().getAttribute("crudzilla_transaction_object");
  
  if(transaction != null){
    //Object action  = httpRequest.getSession().getAttribute("crudzilla_transaction_action");
    c.getArguments().put("crudzilla_transaction_object",transaction);
    c.getArguments().put("crudzilla_transaction_"+transaction.get("name"),httpRequest.getSession().getAttribute("crudzilla_transaction_"+transaction.get("name")));
    c.getArguments().put("crudzilla_transaction_action","join");
  }
  return c;
}

def startTransactionOnly(){
  Object transaction  = crud.call("/crudzilla-app-settings/transaction.ins");  
  
  httpRequest.getSession().setAttribute("crudzilla_transaction_object",transaction);  
  httpRequest.getSession().setAttribute("crudzilla_transaction_action","start_only");
  
  arguments.put("crudzilla_transaction_object",transaction);
  arguments.put("crudzilla_transaction_action","start_only");
  crud.call("/crudzilla-app-settings/transactor.stm",arguments);  
  
  httpRequest.getSession().setAttribute("crudzilla_transaction_"+transaction.get("name"),arguments.get("crudzilla_transaction_"+transaction.get("name")));
}


def commitTransactionOnly(){
  Object transaction  = httpRequest.getSession().getAttribute("crudzilla_transaction_object");
  
  if(transaction != null){
    
    attachTransaction(crud);
    arguments.put("crudzilla_transaction_action","commit_only");
    crud.call("/crudzilla-app-settings/transactor.stm",arguments);
    
    httpRequest.getSession().removeAttribute("crudzilla_transaction_object");  
    httpRequest.getSession().removeAttribute("crudzilla_transaction_action");      
    httpRequest.getSession().removeAttribute("crudzilla_transaction_"+transaction.get("name"));
    
    arguments.remove("crudzilla_transaction_object");
    arguments.remove("crudzilla_transaction_"+transaction.get("name"));
    arguments.remove("crudzilla_transaction_action");    
  }
}



def runCrud(){

  //startTransactionOnly();
  
  
  arguments.put("curTS",new java.util.Date().getTime());
  arguments.put("prevTS",arguments.get("curTS"));
  //Object path2IdMapping = crud.call("../taxonomy/path2id-cache.ins");
  
  //copy default system setting cruds
  String newRelPath = relPath;//deWindowize(new File().getCanonicalPath());
  if(newRelPath.charAt(0) == '/')
      newRelPath = newRelPath.substring(1);  
  
  /*
  if(true){
  	crud.add("fromCategory","dev-logging")
      .add("parent_id",path2IdMapping.get("com/crudzilla/HiveMind/web/dev-logging"))
      .add("toCategory",newRelPath+"/web/dev-logging")
      .call(copyAppTaxonomy);
    
    return false;
  }
  */
  
  String jettyHome = "";
  if(System.getProperty("jetty.home") != null && !System.getProperty("jetty.home").isEmpty())
    jettyHome = System.getProperty("jetty.home");
  else
    jettyHome = crudzilla.sysSettings().get("crudzilla_jetty_home");
  
  
  String appName = relPath.split('/')[relPath.split('/').length-1];
  String assetBaseDir = (new File(crud.appBaseDir()+"/"+crudzilla.sysSettings().get("crudzilla_asset_base")).getCanonicalPath());
  
  
  new File(assetBaseDir+"/"+relPath+"/WEB-INF/classes").mkdirs();
  File libDir = new File(assetBaseDir+"/"+relPath+"/WEB-INF/lib");
  libDir.mkdirs();
  
  boolean usingEmbededDB = false;
  Object dataSourceConfig = null;
  
  if(dataSource != null && !dataSource.isEmpty()){
        
    if(!dataSource.endsWith(".ins")){//assume embeded database needs to be created
      
       dataSourceConfig = crud.call("/crudzilla-app-settings/crudzilla-crud-datasource.ins");
       dataSourceConfig.set("url","jdbc:derby:"+dataSource+";create=true");
       usingEmbededDB = true;
    }
    else
    {
       //extract data source name
       String dataSourceName = dataSource.substring(dataSource.lastIndexOf("/")+1);
      
       //temporarily copy the datasource to the new app directory
       FileUtils.copyFileToDirectory(new File(assetBaseDir+"/"+dataSource),new File(assetBaseDir+"/com/crudzilla/HiveMind/web/crudzilla-temp"));
      
       dataSourceConfig = crud.call("/crudzilla-temp/"+dataSourceName,arguments);
      
       //delete temp file
       new File(assetBaseDir+"/com/crudzilla/HiveMind/web/crudzilla-temp/"+dataSourceName).delete();
    }
    /*
    if(createAuthTables.compareTo("yes") == 0){
        java.sql.Connection conn = (java.sql.Connection)crud.add("dataSourceConfig",dataSourceConfig).call(""+crudzilla.sysSettings().get("crudzilla_datasource_connection_creator"));
        
      
        String dataBaseUrl	  = "";
        String dataBaseUserName = "";
        String dataBasePassWord = "";  
        
        //if(createDatabase.compareToIgnoreCase("yes") == 0){
        //  new QueryRunner().update(conn,"create database "+dataBaseName+";");
        //  new QueryRunner().update(conn,"use database "+dataBaseName+";");
        //}
        //create users table
        new QueryRunner().update(conn,createUsersTable);
        
        //create roles table
        new QueryRunner().update(conn,createRolesTable);
        
        //create user_roles table
        new QueryRunner().update(conn,createUserRolesTable);
        
        //create user_profile table
        new QueryRunner().update(conn,createUserProfileTable);      
      
        //insert default user login info      
        new QueryRunner().update(conn,"insert into roles values(1,'developer')"); 
        new QueryRunner().update(conn,"insert into users values(1,'developer','developer')");
        new QueryRunner().update(conn,"insert into user_roles values(1,1)");
        new QueryRunner().update(conn,"insert into user_profile (user_id) values(1)"); 
    }
    */
    
    String userName = dataSourceConfig.user;
    if(userName == null && dataSourceConfig.userName != null)
    	userName = dataSourceConfig.userName;
    else
    if(userName == null)
        userName = "";
    
    String passWord = dataSourceConfig.password;
    if(passWord == null && dataSourceConfig.passWord != null)
    	passWord = dataSourceConfig.passWord;
    else
    if(passWord == null)
        passWord = "";    
    
    
    //create app xml configs using datasource
    FileUtils.writeStringToFile(new File(assetBaseDir+"/"+relPath+"/WEB-INF/web.xml"), webXml.replaceAll("#crudzilla-app-name",appName).replaceAll("#crudzilla-app-home","crudzilla"+relPath+"/web"));
    FileUtils.writeStringToFile(new File(assetBaseDir+"/"+relPath+"/WEB-INF/jetty-web.xml"), jettyWebXml.replaceAll("#crudzilla-app-name",appName));
    
    
    FileUtils.writeStringToFile(new File(assetBaseDir+"/"+relPath+"/WEB-INF/jetty-env.xml"), jettyEnvXml.replaceAll("#crudzilla-app-name",appName).replaceAll("#crudzilla-database-driver",dataSourceConfig.driverClassName).replaceAll("#crudzilla-database-url",dataSourceConfig.url).replaceAll("#crudzilla-database-username",userName).replaceAll("#crudzilla-database-password",passWord));
    
    //write realm information
    FileUtils.writeStringToFile(new File(assetBaseDir+"/"+relPath+"/WEB-INF/"+appName+".jdbc.realm.properties"), realmProperties.replaceAll("#crudzilla-database-driver",dataSourceConfig.driverClassName).replaceAll("#crudzilla-database-url",dataSourceConfig.url).replaceAll("#crudzilla-database-username",userName).replaceAll("#crudzilla-database-password",passWord));
    FileUtils.copyFileToDirectory(new File(assetBaseDir+"/"+relPath+"/WEB-INF/"+appName+".jdbc.realm.properties"),new File(jettyHome+"/etc"));
    
    FileUtils.writeStringToFile(new File(assetBaseDir+"/"+relPath+"/build.xml"), buildXml.replaceAll("#crudzilla-app-name",appName));
  }
  else{
    //create app xml without datasource
    FileUtils.writeStringToFile(new File(assetBaseDir+"/"+relPath+"/WEB-INF/web.xml"), webXml.replaceAll("#crudzilla-app-name",appName).replaceAll("#crudzilla-app-home","crudzilla"+relPath+"/web").replaceAll("<!--BEGIN SECURITY SECTION-->","<!--BEGIN SECURITY SECTION").replaceAll("<!--END SECURITY SECTION-->","END SECURITY SECTION-->"));
    FileUtils.writeStringToFile(new File(assetBaseDir+"/"+relPath+"/WEB-INF/jetty-web.xml"), jettyWebXml.replaceAll("#crudzilla-app-name",appName).replaceAll("<!--BEGIN SECURITY HANDLER-->","BEGIN SECURITY HANDLER").replaceAll("<!--END SECURITY HANDLER-->","END SECURITY HANDLER").replaceAll("-->","").replaceAll("<!--","").replaceAll("BEGIN SECURITY HANDLER","<!--BEGIN SECURITY HANDLER").replaceAll("END SECURITY HANDLER","END SECURITY HANDLER-->"));
    FileUtils.writeStringToFile(new File(assetBaseDir+"/"+relPath+"/WEB-INF/jetty-env.xml"), jettyEnvXml.replaceAll("#crudzilla-app-name",appName));
    
    //write realm information
    FileUtils.writeStringToFile(new File(assetBaseDir+"/"+relPath+"/WEB-INF/"+appName+".jdbc.realm.properties"), realmProperties.replaceAll("#crudzilla-app-name",appName));
    FileUtils.copyFileToDirectory(new File(assetBaseDir+"/"+relPath+"/WEB-INF/"+appName+".jdbc.realm.properties"),new File(jettyHome+"/etc"));
    
    FileUtils.writeStringToFile(new File(assetBaseDir+"/"+relPath+"/build.xml"), buildXml.replaceAll("#crudzilla-app-name",appName));
  }
  
  logTS("Finished writing WEB-INF");
  //copy over jar dependencies
  /*
  String[] exts = new String[1];
  exts[0] = new String("jar");  
  
  for (File file : FileUtils.listFiles(new File(crud.appBaseDir()+"/crud-web-app-dependencies/core"),exts,false)){
    FileUtils.copyFileToDirectory(file,libDir);
  }
  
  for (File file : FileUtils.listFiles(new File(crud.appBaseDir()+"/crud-web-app-dependencies/jvm-language-support"),exts,false)){
    FileUtils.copyFileToDirectory(file,libDir);
  }
  */
  /***
  //create index page
  String html = FileUtils.readFileToString(new File(assetBaseDir+"/com/crudzilla/HiveMind/crud-web-app-dependencies/web-app-template/index.html"));
  FileUtils.writeStringToFile(new File(assetBaseDir+"/"+relPath+"/web/index.html"),html);
  
  //create login pages
  html = FileUtils.readFileToString(new File(assetBaseDir+"/com/crudzilla/HiveMind/crud-web-app-dependencies/web-app-template/login/login.html"));
  FileUtils.writeStringToFile(new File(assetBaseDir+"/"+relPath+"/web/login/login.html"),html);
  
  html = FileUtils.readFileToString(new File(assetBaseDir+"/com/crudzilla/HiveMind/crud-web-app-dependencies/web-app-template/login/login-error.html"));
  FileUtils.writeStringToFile(new File(assetBaseDir+"/"+relPath+"/web/login/login-error.html"),html);
  
  //create secured index page
  html = FileUtils.readFileToString(new File(assetBaseDir+"/com/crudzilla/HiveMind/crud-web-app-dependencies/web-app-template/secure/index.html"));
  FileUtils.writeStringToFile(new File(assetBaseDir+"/"+relPath+"/web/secure/index.html"),html);
  
  //copy static assets
  FileUtils.copyDirectoryToDirectory(new File(assetBaseDir+"/com/crudzilla/HiveMind/crud-web-app-dependencies/web-app-template/static-assets"),new File(assetBaseDir+"/"+relPath+"/web"));
  
  //copy platform dependencies
  //FileUtils.copyDirectoryToDirectory(new File(crud.appBaseDir()+"/crudzilla-platform"),new File(assetBaseDir+"/"+relPath+"/web"));
  ***/

  logTS("Finished FS operations");
  
  /************************************************************************************
  //copy platform dependencies
  //*"com/crudzilla/HiveMind/web/crudzilla-app-settings"*
  crud.add("fromCategory","crudzilla-platform")
  .add("parent_id",path2IdMapping.get("com/crudzilla/HiveMind/web/crudzilla-platform"))
  .add("toCategory",newRelPath+"/web/crudzilla-platform")
  .call(copyAppTaxonomy);  
  
  logTS("Finished copying platform dependencies");
  
  //copy default application settings
  //*"com/crudzilla/HiveMind/web/crudzilla-app-settings"*
  crud.add("fromCategory","crudzilla-app-settings")
  .add("parent_id",path2IdMapping.get("com/crudzilla/HiveMind/web/crudzilla-app-settings"))
  .add("toCategory",newRelPath+"/web/crudzilla-app-settings")
  .call(copyAppTaxonomy);
  
  logTS("Finished copying settings");
  
  //set default settings based on information currently available
  Object settingsTaxonomy = crud.add("createPath","false").add("taxonomyPath",newRelPath+"/web/crudzilla-app-settings/system-settings").call(findAppTaxonomy);
  
  Object settingsCrud     = crud.add("instantiator_id",settingsTaxonomy.linkId).call(getInstantiator).get(0);
  crud.add("definitionId",settingsCrud.id).add("name","crudzilla_velocity_template_root").add("defaultValue",assetBaseDir+"/"+newRelPath+"/web").call(updateExecutionParameterByName);
  crud.add("definitionId",settingsCrud.id).add("name","crudzilla_crud_home").add("defaultValue",assetBaseDir+"/"+newRelPath+"/web").call(updateExecutionParameterByName);
  crud.add("definitionId",settingsCrud.id).add("name","crudzilla_static_file_base_dir").add("defaultValue",assetBaseDir+"/"+newRelPath+"/web").call(updateExecutionParameterByName);
  crud.add("definitionId",settingsCrud.id).add("name","crudzilla_engine_startup_handler").add("defaultValue","/start-up/on-crud-engine-startup.ste").call(updateExecutionParameterByName);
  
  logTS("Finished initializing settings");
  *****************************************************************************/
  /***
  //copy default crud executables, they'll be overwritten later
  FileUtils.copyDirectoryToDirectory(new File(assetBaseDir+"/com/crudzilla/HiveMind/crud-web-app-dependencies/web-app-template/crudzilla-app-settings"),new File(assetBaseDir+"/"+relPath+"/web"));
  FileUtils.copyDirectoryToDirectory(new File(assetBaseDir+"/com/crudzilla/HiveMind/crud-web-app-dependencies/web-app-template/crudzilla-platform"),new File(assetBaseDir+"/"+relPath+"/web"));
  //new File(assetBaseDir+"/"+relPath+"/web/start-up").mkdirs();
  FileUtils.copyFileToDirectory(new File(assetBaseDir+"/com/crudzilla/HiveMind/crud-web-app-dependencies/web-app-template/app-startup/on-crud-engine-startup.ste"),new File(assetBaseDir+"/"+relPath+"/web/app-startup"));
  logTS("Finished filesystem operations");
  **/
  //copy application template
  FileUtils.copyDirectoryToDirectory(new File(assetBaseDir+"/com/crudzilla/HiveMind/crud-web-app-dependencies/web-app-template/web"),new File(assetBaseDir+"/"+relPath));
  
  String html = FileUtils.readFileToString(new File(assetBaseDir+"/"+relPath+"/web/index.html"));
  FileUtils.writeStringToFile(new File(assetBaseDir+"/"+relPath+"/web/index.html"),html.replaceAll("Project name",appName));
  
  
  //setup default datasource
  /**if(usingEmbededDB){
  	Object dataSourceTaxonomy = crud.add("createPath","false").add("taxonomyPath",newRelPath+"/web/crudzilla-app-settings/crudzilla-crud-datasource").call(findAppTaxonomy);
  	Object dataSourceCrud     = crud.add("instantiator_id",dataSourceTaxonomy.linkId).call(getInstantiator).get(0);
  	crud.add("definitionId",dataSourceCrud.id).add("name","name").add("defaultValue",dataSource).call(updateExecutionParameterByName);
    crud.add("definitionId",dataSourceCrud.id).add("name","url").add("defaultValue","jdbc:derby:"+dataSource+";create=true").call(updateExecutionParameterByName);
  }
  else
  if(dataSourceConfig != null){
      String dataSourceCrudPath = dataSource.substring(0,dataSource.lastIndexOf(".ins"));
    
  	  crud.add("fromCategory",dataSourceCrudPath)
      .add("toCategory",newRelPath+"/web/crudzilla-app-settings")
      .call(copyAppTaxonomy); 
     
      if(dataSourceCrudPath.lastIndexOf('/') != -1)
          dataSourceCrudPath = dataSourceCrudPath.substring(dataSourceCrudPath.lastIndexOf('/')+1);
      
  	  crud.add("definitionId",settingsCrud.id).add("name","crudzilla_default_datasource").add("defaultValue",dataSourceCrudPath+".ins").call(updateExecutionParameterByName);
  }**/
  
  logTS("Finished setting datasource");
  /******************************************************************************
  //*"com/crudzilla/HiveMind/web/dev-logging"*
  //copy cwab logging support
  crud.add("fromCategory","dev-logging")
      .add("parent_id",path2IdMapping.get("com/crudzilla/HiveMind/web/dev-logging"))
      .add("toCategory",newRelPath+"/web/dev-logging")
      .call(copyAppTaxonomy);
  
  logTS("Finished copying dev logging");
  
  //copy startup cruds
  ///*"com/crudzilla/HiveMind/web/start-up/on-crud-engine-startup"*
  crud.add("fromCategory","start-up/on-crud-engine-startup")
      .add("parent_id",path2IdMapping.get("com/crudzilla/HiveMind/web/start-up"))
      .add("toCategory",newRelPath+"/web/start-up")
      .call(copyAppTaxonomy);
  
  
  logTS("Finished copying engine setting");
  
  ///*"com/crudzilla/HiveMind/web/start-up/user-profile"*
  //copy user-profile setup
  crud.add("fromCategory", "start-up/user-profile")
      .add("parent_id",path2IdMapping.get("com/crudzilla/HiveMind/web/start-up"))
      .add("toCategory",newRelPath+"/web/start-up/user-profile")
      .call(copyAppTaxonomy);  
  
  
  logTS("Finished copying user profile");
  
  //set default logging config
  Object logConfigTaxonomy = crud.add("createPath","false").add("taxonomyPath",newRelPath+"/web/dev-logging/config").call(findAppTaxonomy);
  Object logConfigCrud     = crud.add("instantiator_id",logConfigTaxonomy.linkId).call(getInstantiator).get(0);
  crud.add("definitionId",logConfigCrud.id).add("name","classes").add("defaultValue","/dev-logging/classes/class-list.ins").call(updateExecutionParameterByName);
  crud.add("definitionId",logConfigCrud.id).add("name","name").add("defaultValue",appName+"-logger").call(updateExecutionParameterByName);
  
  logTS("Finished copying and initializing logging");
  
  //bake app
  crud.add("relPath",deWindowize(new File("/"+newRelPath+"/web").getCanonicalPath()))
  //.add("parent_id",path2IdMapping.get("com/crudzilla/HiveMind/web/crudzilla-app-settings"))
  .call(bakeCrud);  
  logTS("Finished baking app");
  *****************************************************************************/
  
  
  /*
  //bake systems settings
  crud.add("relPath",deWindowize(new File("/"+newRelPath+"/web/crudzilla-app-settings").getCanonicalPath()))
  //.add("parent_id",path2IdMapping.get("com/crudzilla/HiveMind/web/crudzilla-app-settings"))
  .call(bakeCrud);
  
  logTS("Finished baking settings");
  
  //bake engine startup cruds
  crud.add("relPath",deWindowize(new File("/"+newRelPath+"/web/start-up").getCanonicalPath())).call(bakeCrud);
  
  logTS("Finished baking start up");
  
  //bake logging cruds
  crud.add("relPath",deWindowize(new File("/"+newRelPath+"/web/dev-logging").getCanonicalPath())).call(bakeCrud);
  
  logTS("Finished baking logging");
  */
  
  //create app config object for this app.
  String hostPort = httpRequest.getServerPort() != 80?":"+httpRequest.getServerPort():"";
  
  Object appConfigTypeTemplate = 
    crud.add("createPath","false")
        .add("taxonomyPath","com/crudzilla/HiveMind/web/new-web-app/web-app-type-definition-template")//
        .add("parent_id",/*path2IdMapping.get("com/crudzilla/HiveMind/web/new-web-app")*/"0")
        .call(findAppTaxonomy);
  
  
  String appConfigId = crud
  .add("definition_id",appConfigTypeTemplate.linkId)
  .add("name",appName)
  .add("crudzilla_baseDir_value",/*new File(relPath+"/web").getCanonicalPath()*/ relPath+"/web")
  .add("crudzilla_contextPath_value","http://"+httpRequest.getServerName()+hostPort+"/"+appName+"/crud-appserver")
  .add("crudzilla_name_value",appName)
  .add("crudzilla_main_value","secure/index.html")
  .call(cloneCrudDefinition);	
  
  logTS("Finished cloning app config");
  
  //add it to the right category
  Object appList = crud.add("createPath","false")
  .add("taxonomyPath","com/crudzilla/HiveMind/web/new-web-app/app-list")
  .add("parent_id",/*path2IdMapping.get("com/crudzilla/HiveMind/web/new-web-app")*/"0")
  .call(findAppTaxonomy);
  
  List definedApps = crud.add("parent_id",appList.id).call(getAppTaxonomies);
  
  Object lastItem = null;
  Map preSiblings = new HashMap();
  for(Object obj:definedApps)
     preSiblings.put(obj.preSiblingId,obj.preSiblingId);
  
  for(Object obj:definedApps){
    //if this obj's id isn't a presibling, it is the last item
    if(preSiblings.get(obj.id) == null){
      lastItem = obj;
      break;
    }
  }
  
  crud
  .add("apptaxonomy_id",appList.appTaxonomyId)
  .add("parent_id",appList.id)
  .add("presibling_id",lastItem != null?lastItem.id:"-1")
  .add("link_id",appConfigId)
  .add("link_apptaxonomy_id","-1")
  .add("type",appConfigTypeTemplate.type)
  .add("name",appName)
  .call(addAppTaxonomy);
  
  //add entry to app list
  Object appListEntries = crud.add("createPath","false")//
   							  .add("parent_id",/*path2IdMapping.get("com/crudzilla/HiveMind/web/new-web-app")*/"0")
  							  .add("taxonomyPath","com/crudzilla/HiveMind/web/new-web-app/app-list/apps")
  							 .call(findAppTaxonomy);
  crud
  .add("definitionId",appListEntries.linkId)
  .add("defaultValue",appName+".ins")
  .add("name","")
  .add("type","crud")
  .add("evalRight","yes")
  .add("isFinal","yes")
  .add("position",crud.call("/new-web-app/app-list/apps.ins").size())
  .call(addParameter);
  
  //bake new app config
  crud.add("relPath","/com/crudzilla/HiveMind/web/new-web-app/app-list/"+appName)
   //.add("relPathFrom","com/crudzilla/HiveMind/web/new-web-app/app-list/"+appName)
   //.add("parent_id",/*path2IdMapping.get("com/crudzilla/HiveMind/web/new-web-app")*/"0")
  .call(bakeCrud);
  
  //bake the app list
  crud.add("relPath","/com/crudzilla/HiveMind/web/new-web-app/app-list/apps")
  //.add("relPathFrom","app-list/apps")
  //.add("parent_id",/*path2IdMapping.get("com/crudzilla/HiveMind/web/new-web-app")*/"0")
  .call(bakeCrud);
  logTS("Finished baking app config");
  
  //build this app and auto deploy
  crud.add("relPath","/"+relPath+"/build.xml").call("build-web-app.ste");
  
  
  //deploy context file
  crud.add("relPath",relPath+"/WEB-INF/jetty-web.xml")
      .add("appName",appName)
      .call("deploy-context.ste");
  
  //flush app list from cache
  crudzilla.inValidateCrudCache(CrudzillaUtil.getCrudFile(crudzilla,"/new-web-app/app-list/apps.ins").getCanonicalPath());  
  
  //commitTransactionOnly();
}

runCrud();
