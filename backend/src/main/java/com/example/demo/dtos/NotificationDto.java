package com.example.demo.dtos;

public class NotificationDto {
    
    private String createrNAme;
    private String title;
    private String creationDate;
    private String Content;

    public NotificationDto(){}

    public String getCreaterName(){return this.createrNAme;}
    public String getTitle(){return this.title;}
    public String getCreationDate(){return this.creationDate;}
    public String getContent(){return this.Content;}
    public void setCreaterName(String creater){this.createrNAme = creater;}
    public void setTitle(String Title){this.title = Title;}
    public void setCreationDate(String date){this.creationDate = date;}
    public void setContent(String content){this.Content = content;}
}
