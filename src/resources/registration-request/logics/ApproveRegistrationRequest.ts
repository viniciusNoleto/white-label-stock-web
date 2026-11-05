import { Component, input, output, type Signal } from '@angular/core';
import { FormButton } from '@/components/form/Button';
import { injectNotify } from '@/utils/notify';
import { createMutation } from '@/utils/query';
import { TranslatePipe } from '@/utils/translate.pipe';
import { approveRegistrationRequestService } from '../services/approveRegistrationRequest';

export function injectApproveRegistrationRequestLogicData({ editingRegistrationRequestId, onSuccess }: { editingRegistrationRequestId: Signal<number | undefined>; onSuccess: () => void }) {
  const notify = injectNotify();

  const approveRegistrationRequestMutation = createMutation({
    mutationFn: () => approveRegistrationRequestService({ registrationRequestId: editingRegistrationRequestId()! }),
    onSuccess: (res) => {
      notify.success(res);

      onSuccess();
    },
    onError: (err) => notify.error(err, 'notifications.errors.approveRegistrationRequest'),
  });

  return { approveRegistrationRequestMutation };
}

@Component({
  selector: 'app-approve-registration-request-logic',
  imports: [FormButton, TranslatePipe],
  template: `
    @let isPending = logicData().approveRegistrationRequestMutation.isPending();

    <div class="flex flex-col gap-6">
      <p class="text-sm text-gray-600 dark:text-gray-400">
        {{ 'registrationRequests.approve.confirm' | t: { name: requesterName(), email: requesterEmail() } }}
      </p>

      <div class="flex justify-end gap-2">
        <button
          appButton
          variant="ghost"
          [disabled]="isPending"
          (click)="cancel.emit()"
        >
          {{ 'common.actions.cancel' | t }}
        </button>

        <button
          appButton
          variant="default"
          [loading]="isPending"
          (click)="logicData().approveRegistrationRequestMutation.mutate()"
        >
          {{ 'registrationRequests.actions.approve' | t }}
        </button>
      </div>
    </div>
  `,
})
export class ApproveRegistrationRequestLogicComponent {
  readonly logicData = input.required<ReturnType<typeof injectApproveRegistrationRequestLogicData>>();
  readonly requesterName = input.required<string>();
  readonly requesterEmail = input.required<string>();
  readonly cancel = output<void>();
}
