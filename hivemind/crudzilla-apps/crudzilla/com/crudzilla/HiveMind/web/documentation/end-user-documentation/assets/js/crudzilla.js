var crudzilla = {
  pricing:{
    "commercial":600,
    "developer":300,
    "academic":150
  },
  init:function(){
    $('#myModal').modal(options);
    this.init_subscribe();
  },
  orderSubtotal:0,
  init_license_purchase:function(){
    
    Stripe.setPublishableKey('pk_3RQNTdg3L1unc2jtAe7uAOopZc2AL');
    
    this.orderSubtotal = 0;
    function getURLParameter(name) {
      return decodeURIComponent(
        (RegExp(name + '=' + '(.+?)(&|$)', 'i').exec(location.search) || [, ""])[1]
      );
    }    
    
    var t = getURLParameter("t");
    
    
    if(t=='a')
      $("#licenseType").val("academic");
    else
    if(t=='d'){
      $("#licenseType").val("developer"); 
      $("#license-count").css({"display":"none"});
    }
    else
    if(t=='c')
      $("#licenseType").val("commercial");    
    
    
    $("#licenseType").change(function(){
          var subtotal = 0;
          var licenseCount = 1;
          if($(this).val() == "developer"){
              $("#license-count").css({"display":"none"});
          }
          else{
              $("#license-count").css({"display":"block"});
              if($("#licenseCount").val() != "")
                licenseCount = $("#licenseCount").val();
          }
      	
      	  crudzilla.orderSubtotal = (licenseCount*crudzilla.pricing[$(this).val()]);
          $(".subtotal").html( "<h3>$<span id=\"subtotal_value\">"+crudzilla.orderSubtotal+"</span></h3>");
    });   
    
    $("#licenseCount").val("1").change(function(){
          var subtotal = 0;
          var licenseCount = 1;
          if($(this).val() != ""){
              licenseCount = $(this).val();
          }     	
      	  crudzilla.orderSubtotal = (licenseCount*crudzilla.pricing[$("#licenseType").val()]);
          $(".subtotal").html("<h3>$<span id=\"subtotal_value\">"+crudzilla.orderSubtotal+"</span></h3>");
    });    
    $(".subtotal").html("<h3>$<span id=\"subtotal_value\">"+ (crudzilla.pricing[$("#licenseType").val()]) +"</span></h3>");

    $(".cc-4part").change(function(){
    	$("#credit-card-number").val($("#cc-part1").val()+$("#cc-part2").val()+$("#cc-part3").val()+$("#cc-part4").val());
    });
    
    
    $('#payment-form').submit(function(event) {
      	var $form = $(this);
      
        
      
  		$(".payment-errors").empty();
      
     	 // Disable the submit button to prevent repeated clicks
      	$form.find('button').prop('disabled', true);
  
      	
        Stripe.createToken($form, function(status,response){
          
          if(status == '200'){
              var customer ={
                "fullName":$("#fullName").val(),
                "address":$("#address").val(),
                "organization":$("#organization").val(),
                "emailAddress":$("#emailAddress").val(),
                "phoneNumber":$("#phoneNumber").val(),
                "licenseCount":$("#licenseCount").val(),
                "licenseType":$("#licenseType").val(),
                "invoiceId":response.id,
                "amount":$($("#subtotal_value")[0]).text()
              };

             if(customer.licenseType == "developer")
               	customer.licenseCount = 1;
            
              
              $.ajax({
                type:'POST',
                data:customer,
                url:"data/com/crudzilla/crudzilla-website/customer/add-customer.stm",
                success:function(data){
                  $("#customer-license-key").css({"display":"block"}).html("Thank you! Your license key is:"+data+" <br/> Please keep this key for reference.")
                }});           
           }else{
             $(".payment-errors").append(status+"-"+response.error.type+"<br/>"+response.error.message);
           }
        });
  
      	// Prevent the form from submitting with the default action
      	return false;
    });    
  },
  init_contact:function(){
    $('#contact-form').submit(function(event) {
      	var $form = $(this);

      	$form.find('button').prop('disabled', true);
     	 // Disable the submit button to prevent repeated clicks
      	
        var message ={
          "senderName":$("#senderName").val(),
          "senderEmailAddress":$("#senderEmailAddress").val(),
          "message":$("#message").val()+"\n Reply To:"+$("#senderEmailAddress").val()
        };
        
      	
        $.ajax({
          type:'POST',
          data:message,
          url:"../customer/send-business-inquiry.esd",
          success:function(data){
            $("#confirmation").css({"display":"block"}).html("Thank you! We'll be in touch.");
            
         }});  
  
      	// Prevent the form from submitting with the default action
      	return false;
    });    
  },
  init_blog:function(){
  	this.init_subscribe();
  },
  init_subscribe:function(h){
    $('#subscriber-form').submit(function(event) {
      	var $form = $(this);

      	$form.find('button').prop('disabled', true);
     	// Disable the submit button to prevent repeated clicks
      	
        var message ={
          "emailAddress":$("#newsletterSubscriberEmail").val()
        };
        
      	
        $.ajax({
          type:'POST',
          data:message,
          url:(typeof h == "undefined")?"../data/com/crudzilla/crudzilla-website/news-subscriber/add-subscriber.stm":"data/com/crudzilla/crudzilla-website/news-subscriber/add-subscriber.stm",
          success:function(data){
             $("#confirmation").css({"display":"block"}).html("Thank you! We'll be in touch.");
             
         }});  
  
      	// Prevent the form from submitting with the default action
      	return false;
    });    
  }
}