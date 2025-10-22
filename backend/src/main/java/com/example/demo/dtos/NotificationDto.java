package com.example.demo.dtos;

public class NotificationDto {
    
    private Long id;
    private String creatorName;
    private String title;
    private String creationDate;
    private String content;
    private boolean read;

    public NotificationDto(){}

    public Long getId() { return this.id; }
    public void setId(Long id) { this.id = id; }
    
    public String getCreatorName(){return this.creatorName;}
    public String getTitle(){return this.title;}
    public String getCreationDate(){return this.creationDate;}
    public String getContent(){return this.content;}
    public boolean isRead() { return this.read; }
    
    public void setCreatorName(String creator){this.creatorName = creator;}
    public void setTitle(String Title){this.title = Title;}
    public void setCreationDate(String date){this.creationDate = date;}
    public void setContent(String content){this.content = content;}
    public void setRead(boolean read) { this.read = read; }
}
