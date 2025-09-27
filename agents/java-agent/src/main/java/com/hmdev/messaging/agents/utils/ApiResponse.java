package com.hmdev.messaging.agents.utils;

import org.json.JSONObject;



/**
 * 
 * @author Haitham Mubarak
 *
 */
public class ApiResponse {

	public enum Status{
		SUCCESS,ERROR;
		
		public static Status fromString(String status){
			if(status.equalsIgnoreCase("success")){
				return SUCCESS;
			}else if (status.equalsIgnoreCase("error")){
				return ERROR;
			}else{
				return null;
			}
		}
	}
	
	private Status status;
	private String data;
	
	public ApiResponse(String status,String data){
		this(Status.fromString(status),data);
	}
	
	public ApiResponse(Status status,String data){
		this.status = status;
		this.data = data;
	}
	
	public Status status() {
		return status;
	}

	public String data() {
		return data;
	}
	
	public String toString(){
		JSONObject obj = new JSONObject();
		obj.put("status", status);
		obj.put("data", data);
		
		return obj.toString(2);
	}
	
}
