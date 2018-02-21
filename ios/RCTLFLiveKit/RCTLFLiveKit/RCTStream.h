//
//  RCTStream.h
//  RCTLFLiveKit
//
//  Created by 권오빈 on 2016. 8. 10..
//  Copyright © 2016년 권오빈. All rights reserved.
//

#import <UIKit/UIKit.h>
#import <React/RCTView.h>

@class RCTEventDispatcher;
@class RCTStreamManager;

@interface RCTStream : UIView

@property (nonatomic, copy) RCTBubblingEventBlock onLiveReady;
@property (nonatomic, copy) RCTBubblingEventBlock onLivePending;
@property (nonatomic, copy) RCTBubblingEventBlock onLiveStart;
@property (nonatomic, copy) RCTBubblingEventBlock onLiveError;
@property (nonatomic, copy) RCTBubblingEventBlock onLiveStop;

- (instancetype)initWithEventDispatcher:(RCTEventDispatcher *)eventDispatcher NS_DESIGNATED_INITIALIZER;

@end
