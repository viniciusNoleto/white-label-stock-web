import { Component, input, output, type Signal } from '@angular/core';
import { FormButton } from '@/components/form/Button';
import { injectNotify } from '@/utils/notify';
import { createMutation } from '@/utils/query';
import { TranslatePipe } from '@/utils/translate.pipe';
import { rejectRegistrationRequestService } from '../services/rejectRegistrationRequest';

export function injectRejectRegistrationRequestLogicData({ editingRegistrationRequestId, onSuccess }: { editingRegistrationRequestId: Signal<number | undefined>; onSuccess: () => void }) {
  const notify = injectNotify();

  const rejectRegistrationRequestMutation = createMutation({
    mutationFn: () => rejectRegistrationRequestService({ registrationRequestId: editingRegistrationRequestId()! }),
    onSuccess: (res) => {
      notify.success(res);

      onSuccess();
    },
    onError: (err) => notify.error(err, 'notifications.errors.rejectRegistrationRequest'),
  });

  return { rejectRegistrationRequestMutation };
}

@Component({
  selector: 'app-reject-registration-request-logic',
  imports: [FormButton, TranslatePipe],
  template: `
    @let isPending = logicData().rejectRegistrationRequestMutation.isPending();

    <div class="flex flex-col gap-6">
      <p class="text-sm text-gray-600 dark:text-gray-400">
        {{ 'registrationRequests.reject.confirm' | t: { name: requesterName(), email: requesterEmail() } }}
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
          variant="destructive"
          [loading]="isPending"
          (click)="logicData().rejectRegistrationRequestMutation.mutate()"
        >
          {{ 'registrationRequests.actions.reject' | t }}
        </button>
      </div>
    </div>
  `,
})
export class RejectRegistrationRequestLogicComponent {
  readonly logicData = input.required<ReturnType<typeof injectRejectRegistrationRequestLogicData>>();
  readonly requesterName = input.required<string>();
  readonly requesterEmail = input.required<string>();
  readonly cancel = output<void>();
}
