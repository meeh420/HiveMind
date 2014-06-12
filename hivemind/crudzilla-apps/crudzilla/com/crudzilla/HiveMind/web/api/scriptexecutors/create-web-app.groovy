import org.apache.commons.io.FileUtils;
import java.io.File;

String appName = relPath.split('/')[relPath.split('/').length-1];

new File(crud.appBaseDir()+"/"+relPath+"/WEB-INF/classes").mkdirs();
File libDir = new File(crud.appBaseDir()+"/"+relPath+"/WEB-INF/lib");
libDir.mkdirs();

FileUtils.writeStringToFile(new File(crud.appBaseDir()+"/"+relPath+"/WEB-INF/web.xml"), webXml);
FileUtils.writeStringToFile(new File(crud.appBaseDir()+"/"+relPath+"/WEB-INF/jetty-web.xml"), jettyWebXml.replace("#crudzilla-app-name",appName));
//FileUtils.writeStringToFile(new File(crud.appBaseDir()+"/"+relPath+"/WEB-INF/jetty-env.xml"), jettyEnvXml.replace("#crudzilla-app-name",appName));
FileUtils.writeStringToFile(new File(crud.appBaseDir()+"/"+relPath+"/WEB-INF/"+appName+".jdbc.realm.properties"), realmProperties.replace("#crudzilla-app-name",appName));
FileUtils.writeStringToFile(new File(crud.appBaseDir()+"/"+relPath+"/build.xml"), buildXml.replace("#crudzilla-app-name",appName));

String[] exts = new String[1];
exts[0] = new String("jar");

for (File file : FileUtils.listFiles(new File(crud.appBaseDir()+"/crud-web-app-dependencies/core"),exts,false)){
  FileUtils.copyFileToDirectory(file,libDir);
}

for (File file : FileUtils.listFiles(new File(crud.appBaseDir()+"/crud-web-app-dependencies/jvm-language-support"),exts,false)){
  FileUtils.copyFileToDirectory(file,libDir);
}