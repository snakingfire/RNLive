//
//  RCTStreamManager.m
//  RCTLFLiveKit
//
//  Created by 권오빈 on 2016. 8. 9..
//  Copyright © 2016년 권오빈. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <React/RCTBridge.h>
#import "RCTStreamManager.h"
//#import "LFLivePreview.h"
#import "RCTStream.h"

@implementation RCTStreamManager

RCT_EXPORT_MODULE();

@synthesize bridge = _bridge;

- (UIView *) view
{
	return [[RCTStream alloc] initWithEventDispatcher:self.bridge.eventDispatcher];
}

- (dispatch_queue_t)methodQueue
{
    return dispatch_get_main_queue();
}

RCT_EXPORT_VIEW_PROPERTY(started, BOOL);
RCT_EXPORT_VIEW_PROPERTY(cameraFronted, BOOL);
RCT_EXPORT_VIEW_PROPERTY(url, NSString);
RCT_EXPORT_VIEW_PROPERTY(landscape, BOOL);

RCT_EXPORT_VIEW_PROPERTY(onLiveReady, RCTBubblingEventBlock);
RCT_EXPORT_VIEW_PROPERTY(onLivePending, RCTBubblingEventBlock);
RCT_EXPORT_VIEW_PROPERTY(onLiveStart, RCTBubblingEventBlock);
RCT_EXPORT_VIEW_PROPERTY(onLiveError, RCTBubblingEventBlock);
RCT_EXPORT_VIEW_PROPERTY(onLiveStop, RCTBubblingEventBlock);

@end
